#!/usr/bin/env python3
"""Link this repo's skills into an agent skills directory.

This is for local ByteTrue self-development: keep other personal skills in
~/.agents/skills, but replace every skill whose name exists in this repo with a
symlink to ./skills/<name>.
"""

import argparse
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path


DEFAULT_DEST = Path.home() / ".agents" / "skills"


def repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def skill_dirs(source: Path):
    if not source.is_dir():
        raise SystemExit(f"source directory does not exist: {source}")

    items = []
    for path in sorted(source.iterdir(), key=lambda p: p.name):
        if path.is_dir() and (path / "SKILL.md").is_file():
            items.append(path)
    return items


def same_link(target: Path, source: Path) -> bool:
    if not target.is_symlink():
        return False
    try:
        return target.resolve(strict=True) == source.resolve(strict=True)
    except FileNotFoundError:
        return False


def unique_backup_path(backup_root: Path, name: str) -> Path:
    candidate = backup_root / name
    if not candidate.exists() and not candidate.is_symlink():
        return candidate

    index = 2
    while True:
        candidate = backup_root / f"{name}-{index}"
        if not candidate.exists() and not candidate.is_symlink():
            return candidate
        index += 1


def remove_existing(path: Path) -> None:
    if path.is_symlink() or path.is_file():
        path.unlink()
        return
    if path.is_dir():
        shutil.rmtree(str(path))
        return
    if path.exists():
        raise SystemExit(f"cannot remove unsupported path type: {path}")


def replace_with_link(source: Path, target: Path, backup_root: Path, dry_run: bool, no_backup: bool) -> str:
    if same_link(target, source):
        return "already-linked"

    has_existing = target.exists() or target.is_symlink()

    if dry_run:
        if has_existing:
            return "would-replace"
        return "would-link"

    if has_existing:
        if no_backup:
            remove_existing(target)
        else:
            backup_root.mkdir(parents=True, exist_ok=True)
            backup_path = unique_backup_path(backup_root, target.name)
            shutil.move(str(target), str(backup_path))

    os.symlink(str(source), str(target), target_is_directory=True)
    if has_existing:
        return "replaced"
    return "linked"


def parse_args(argv):
    parser = argparse.ArgumentParser(
        description="Symlink every skill in this repo into ~/.agents/skills while preserving unrelated skills."
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=repo_root() / "skills",
        help="source skills directory, default: <repo>/skills",
    )
    parser.add_argument(
        "--dest",
        type=Path,
        default=DEFAULT_DEST,
        help="destination skills directory, default: ~/.agents/skills",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="print planned changes without modifying files",
    )
    parser.add_argument(
        "--no-backup",
        action="store_true",
        help="delete replaced entries instead of moving them into a timestamped backup directory",
    )
    return parser.parse_args(argv)


def main(argv=None) -> int:
    args = parse_args(argv if argv is not None else sys.argv[1:])
    source = args.source.expanduser().resolve()
    dest = args.dest.expanduser()

    skills = skill_dirs(source)
    if not skills:
        raise SystemExit(f"no skills with SKILL.md found under: {source}")

    if dest.exists() and not dest.is_dir():
        raise SystemExit(f"destination exists but is not a directory: {dest}")

    backup_root = dest / ".bytetrue-link-backups" / datetime.now().strftime("%Y%m%d-%H%M%S")

    if not args.dry_run:
        dest.mkdir(parents=True, exist_ok=True)

    print(f"source: {source}")
    print(f"dest:   {dest.expanduser()}")
    if args.dry_run:
        print("mode:   dry-run")
    elif args.no_backup:
        print("backup: disabled")
    else:
        print(f"backup: {backup_root}")
    print()

    counts = {}
    for source_skill in skills:
        target = dest / source_skill.name
        status = replace_with_link(source_skill, target, backup_root, args.dry_run, args.no_backup)
        counts[status] = counts.get(status, 0) + 1
        print(f"{status:14} {target} -> {source_skill}")

    print()
    summary = ", ".join(f"{key}={counts[key]}" for key in sorted(counts))
    print(f"summary: {len(skills)} skills, {summary}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
