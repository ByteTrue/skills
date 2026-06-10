# onboard reference templates

This file provides the skeleton templates used by `bt-onboard`.

## 1. Placeholder Template for `.bytetrue/architecture/ARCHITECTURE.md`

```markdown
# {Project Name} Architecture Entry

> Status: skeleton (to be filled)
> Created: YYYY-MM-DD

## 1. Project Overview

## 2. Core Concepts / Glossary

## 3. Subsystem / Module Index

## 4. Key Architecture Decisions

## 5. Known Constraints / Hard Boundaries
```

## 2. Minimal Template for `.bytetrue/attention.md`

`attention.md` is the entry point for project notes that every ByteTrue skill must read at startup. Onboard creates only the minimal skeleton and does not fill in project-specific substantive content for the owner. Later short rules are appended by `bt-note`.

```markdown
# Attention

This file is the entry point for project notes that every ByteTrue skill must read at startup. Every ByteTrue sub-skill must read it before starting work.

## Project Fragment Knowledge

<!-- bt-note managed: maintain with bt-note; append new entries under the sections below -->

### Compile and Build

### Running and Starting Local Services

### Testing

### Command and Script Pitfalls

### Path and Directory Conventions

### Environment Variables and Credentials

### Other
```
