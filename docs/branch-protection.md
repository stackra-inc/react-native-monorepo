# Branch Protection Rules

Recommended GitHub branch protection configuration for the `main` branch. These
rules enforce quality gates and prevent accidental direct pushes.

---

## Table of Contents

- [Overview](#overview)
- [Recommended Rules](#recommended-rules)
- [Step-by-Step Configuration](#step-by-step-configuration)
- [Verifying the Setup](#verifying-the-setup)

---

## Overview

Branch protection ensures that all changes to `main` go through a pull request,
pass CI checks, and receive at least one code review. This prevents broken code
from reaching the default branch and maintains a clean, linear commit history.

---

## Recommended Rules

| Rule                              | Setting                  | Why                                                        |
| --------------------------------- | ------------------------ | ---------------------------------------------------------- |
| Require status checks             | CI workflow must pass    | Prevents merging code that fails lint, type-check, or test |
| Require pull request reviews      | At least 1 approval      | Ensures another developer has reviewed the change          |
| Restrict direct pushes            | No direct pushes to main | Forces all changes through the PR workflow                 |
| Require linear history            | Enabled                  | Keeps the commit graph clean (squash or rebase merges)     |
| Require branches to be up to date | Enabled                  | Ensures the PR is tested against the latest main           |

---

## Step-by-Step Configuration

### 1. Navigate to Branch Protection Settings

1. Go to your repository on GitHub.
2. Click **Settings** (gear icon in the top navigation).
3. In the left sidebar, click **Branches** (under "Code and automation").
4. Under **Branch protection rules**, click **Add branch protection rule** (or
   **Add classic branch protection rule** if using the new UI).

### 2. Set the Branch Name Pattern

1. In the **Branch name pattern** field, enter: `main`
2. This rule will apply to the `main` branch only.

### 3. Require Status Checks Before Merging

1. Check **Require status checks to pass before merging**.
2. Check **Require branches to be up to date before merging**.
3. In the search box, search for and select the CI status check:
   - `ci` (or the specific job name: `Lint, Type-Check & Test`)
4. This ensures the CI pipeline passes before any PR can be merged.

### 4. Require Pull Request Reviews

1. Check **Require a pull request before merging**.
2. Under this section, check **Require approvals**.
3. Set **Required number of approvals before merging** to `1`.
4. Optionally check **Dismiss stale pull request approvals when new commits are
   pushed** to require re-review after changes.

### 5. Disable Direct Pushes

1. Check **Restrict who can push to matching branches**.
2. Leave the list empty (or add only bot accounts if needed).
3. This prevents anyone from pushing directly to `main` — all changes must go
   through a pull request.

### 6. Require Linear History

1. Check **Require linear history**.
2. This enforces squash merges or rebase merges, preventing merge commits.
3. The result is a clean, linear commit history on `main`.

### 7. Save the Rule

1. Scroll to the bottom and click **Create** (or **Save changes**).
2. The rule takes effect immediately.

---

## Verifying the Setup

After configuring the rules:

1. **Test direct push rejection**: Try pushing a commit directly to `main`.
   GitHub should reject it with a protection rule error.

2. **Test CI requirement**: Open a PR with a failing test. The merge button
   should be disabled until CI passes.

3. **Test review requirement**: Open a PR without any reviews. The merge button
   should be disabled until at least one approval is given.

4. **Test linear history**: Try creating a merge commit. GitHub should only
   allow squash or rebase merge options.

---

## Notes

- Repository admins can bypass these rules by default. Consider checking **Do
  not allow bypassing the above settings** for stricter enforcement.
- These rules can also be configured via the GitHub API or Terraform for
  infrastructure-as-code workflows.
- For organizations, consider using **Rulesets** (Settings → Rules → Rulesets)
  which offer more granular control and can apply across multiple repositories.
