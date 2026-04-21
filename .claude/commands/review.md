---
agent: code-reviewer
description: Review all changes in current branch (committed + uncommitted)
---

Review all relevant code changes in the current working branch.

---

## Scope

You MUST include:

1. All committed changes in current branch (vs base branch)
2. All staged changes
3. All unstaged changes

---

## Steps

### 1. Prepare repository

Run:

git fetch origin

---

### 2. Detect base branch

Try in order:

1. origin/main
2. origin/master
3. main
4. master

---

### 3. Get branch changes (unmerged)

Use triple-dot diff:

git diff origin/main...HEAD

List changed files:

git diff --name-only origin/main...HEAD

---

### 4. Get uncommitted changes

#### Staged:

git diff --staged

#### Unstaged:

git diff

---

### 5. Merge review scope

You MUST review:

- branch changes
- staged changes
- unstaged changes

Avoid duplicate analysis if the same file appears multiple times.

---

### 6. Filter out irrelevant files

Ignore:

- lock files (pnpm-lock.yaml, package-lock.json, yarn.lock)
- generated folders (dist/, build/, .next/, coverage/)
- binary files
- pure formatting changes

---

### 7. Handle large diffs

If changes are too large:

- Review per file instead of entire diff
- Prioritize:
  - new files
  - core business logic
  - API/interface changes
  - error handling

---

### 8. Execute review

Apply the `code-reviewer` agent rules.

---

### 9. Risk evaluation

Classify overall change risk:

- HIGH -> breaking / security / major logic
- MEDIUM -> moderate impact
- LOW -> minor or safe
