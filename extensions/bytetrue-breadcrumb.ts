// @ts-nocheck
const fs = require("node:fs");
const path = require("node:path");

function safeRead(filePath) {
	try {
		return fs.readFileSync(filePath, "utf8");
	} catch {
		return "";
	}
}

function exists(filePath) {
	try {
		return fs.existsSync(filePath);
	} catch {
		return false;
	}
}

function toRepoPath(cwd, absolutePath) {
	return path.relative(cwd, absolutePath).split(path.sep).join("/");
}

function frontmatterValue(markdown, key) {
	const match = markdown.match(new RegExp(`^${key}:\\s*([^\\n]+)`, "m"));
	return match ? match[1].replace(/^['"]|['"]$/g, "").trim() : null;
}

function findFirstFile(dir, suffix) {
	try {
		const hit = fs.readdirSync(dir).find((name) => name.endsWith(suffix));
		return hit ? path.join(dir, hit) : null;
	} catch {
		return null;
	}
}

function yamlSection(yaml, section) {
	const start = yaml.indexOf(`${section}:`);
	if (start < 0) return "";
	const rest = yaml.slice(start + section.length + 1);
	if (section === "steps") {
		const next = rest.indexOf("\nchecks:");
		return next >= 0 ? rest.slice(0, next) : rest;
	}
	return rest;
}

function statusesInSection(yaml, section) {
	return Array.from(
		yamlSection(yaml, section).matchAll(/^\s*status:\s*([^\n]+)/gm),
	).map((match) => match[1].trim().replace(/^['"]|['"]$/g, ""));
}

function featureState(cwd, featureDir) {
	const designPath = findFirstFile(featureDir, "-design.md");
	if (!designPath) return null;

	const design = safeRead(designPath);
	const designStatus = frontmatterValue(design, "status");
	const artifact = toRepoPath(cwd, designPath);

	if (designStatus === "draft") {
		return {
			mode: "feature-design",
			artifact,
			status: "design draft",
			next_action:
				"continue feature design review; do not implement before approval",
			guardrails: [
				"read roadmap/design inputs",
				"keep status draft until user approval",
				"do not generate implementation changes",
			],
		};
	}

	const checklistPath = findFirstFile(featureDir, "-checklist.yaml");
	if (designStatus === "approved" && checklistPath) {
		const checklist = safeRead(checklistPath);
		const stepStatuses = statusesInSection(checklist, "steps");
		const checkStatuses = statusesInSection(checklist, "checks");
		const checklistArtifact = toRepoPath(cwd, checklistPath);

		if (
			stepStatuses.length > 0 &&
			stepStatuses.some((status) => status !== "done")
		) {
			const implManifest = findFirstFile(featureDir, "-impl-context.jsonl");
			return {
				mode: "feature-impl",
				artifact,
				status: `pending implementation step in ${checklistArtifact}`,
				next_action:
					"continue the next pending checklist step; do not enter acceptance yet",
				guardrails: [
					`read ${artifact}`,
					`read ${checklistArtifact}`,
					implManifest
						? `read ${toRepoPath(cwd, implManifest)}`
						: "read impl-context if present",
					"follow checklist steps in order",
					"do not change scope without design update",
				],
			};
		}

		if (
			stepStatuses.length > 0 &&
			stepStatuses.every((status) => status === "done") &&
			checkStatuses.length > 0 &&
			checkStatuses.some((status) => status !== "passed")
		) {
			const checkManifest = findFirstFile(featureDir, "-check-context.jsonl");
			return {
				mode: "feature-accept",
				artifact,
				status: `pending acceptance checks in ${checklistArtifact}`,
				next_action:
					"run acceptance closure; verify independently before reporting done",
				guardrails: [
					`read ${artifact}`,
					`read ${checklistArtifact}`,
					checkManifest
						? `read ${toRepoPath(cwd, checkManifest)}`
						: "read check-context if present",
					"write back architecture, requirement, and roadmap when needed",
					"do not treat implementation review as final acceptance",
				],
			};
		}
	}

	return null;
}

function roadmapState(cwd) {
	const roadmapRoot = path.join(cwd, ".bytetrue", "roadmap");
	if (!exists(roadmapRoot)) return null;

	try {
		const roadmapDirs = fs
			.readdirSync(roadmapRoot, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.map((entry) => path.join(roadmapRoot, entry.name))
			.sort()
			.reverse();

		for (const dir of roadmapDirs) {
			const itemsPath = findFirstFile(dir, "-items.yaml");
			if (!itemsPath) continue;
			const items = safeRead(itemsPath);
			if (!/^\s*status:\s*in-progress\s*$/m.test(items)) continue;
			return {
				mode: "roadmap",
				artifact: toRepoPath(cwd, itemsPath),
				status: "roadmap item in-progress",
				next_action:
					"continue the active roadmap-backed feature or finish its acceptance before starting another roadmap item",
				guardrails: [
					"read the roadmap main doc and items.yaml",
					"feature workflow owns in-progress and done transitions",
					"do not mark roadmap items done outside acceptance",
				],
			};
		}
	} catch {
		return null;
	}

	return null;
}

function deriveState(cwd) {
	if (!exists(path.join(cwd, ".bytetrue", "attention.md"))) return null;

	const featuresRoot = path.join(cwd, ".bytetrue", "features");
	if (exists(featuresRoot)) {
		try {
			const featureDirs = fs
				.readdirSync(featuresRoot, { withFileTypes: true })
				.filter((entry) => entry.isDirectory())
				.map((entry) => path.join(featuresRoot, entry.name))
				.sort()
				.reverse();

			for (const dir of featureDirs) {
				const state = featureState(cwd, dir);
				if (state) return state;
			}
		} catch {
			return null;
		}
	}

	return roadmapState(cwd);
}

function renderBreadcrumb(state) {
	const guardrails = state.guardrails.map((item) => `- ${item}`).join("\n");
	return `<bytetrue-workflow-state>\nMode: ${state.mode}\nArtifact: ${state.artifact ?? "none"}\nStatus: ${state.status ?? "unknown"}\nNext action: ${state.next_action}\nGuardrails:\n${guardrails}\n</bytetrue-workflow-state>`;
}

function bytetrueBreadcrumb(pi) {
	pi.on("before_agent_start", async (event, ctx) => {
		const currentPrompt =
			typeof event.systemPrompt === "string" ? event.systemPrompt : "";
		if (currentPrompt.includes("<bytetrue-workflow-state>")) return undefined;

		const cwd = typeof ctx?.cwd === "string" ? ctx.cwd : process.cwd();
		const state = deriveState(cwd);
		if (!state || state.mode === "none") return undefined;

		return {
			systemPrompt: `${currentPrompt}\n\n${renderBreadcrumb(state)}`,
		};
	});
}

module.exports = bytetrueBreadcrumb;
module.exports.default = bytetrueBreadcrumb;
