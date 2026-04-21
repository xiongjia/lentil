---
agent: code-reviewer
description: Full review (branch + uncommitted)
---

## Scope

Review ALL changes:

1. branch vs base
2. staged
3. unstaged

---

## Steps

### 1. Fetch

git fetch origin

---

### 2. Base branch

Try:

- origin/main
- origin/master

---

### 3. Branch diff

git diff origin/main...HEAD
git diff --name-only origin/main...HEAD

---

### 4. Uncommitted

Staged:
git diff --staged

Unstaged:
git diff

---

### 5. Merge scope

Combine all changes.

Avoid duplicate file review.

---

### 6. Filter

Ignore:

- lock files
- dist/build/.next
- generated code

---

### 7. Large diff strategy

- Review per file
- Prioritize:
  - new files
  - core logic
  - API changes

---

### 8. Execute review

Use code-reviewer agent

---

### 9. Risk classification

HIGH / MEDIUM / LOW