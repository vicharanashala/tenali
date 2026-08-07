# Feature Proposal Process for Tenali Interns

As we scale development with multiple interns building parallel features, we need a structured way to review feature ideas before they clutter the codebase, while keeping the actual implementation process as lightweight as possible.

This document outlines the **Issue-to-PR Funnel**, designed specifically for interns proposing new features. 

*(Note: Other types of contributions, such as bug fixes, documentation updates, or minor UI tweaks, can bypass the Issue/RFC requirement and follow the conventional GitHub PR process).*

---

## The Workflow

The core philosophy is to keep high-level brainstorming and design discussions in GitHub Issues, and reserve Pull Requests for fully-baked, approved implementations.

### Step 1: The Feature Proposal (GitHub Issue)
1. Before writing any code or technical design documents, the intern opens a **GitHub Issue** using the `Feature Proposal` template (`docs/templates/feat-issue-temp.md`).
2. This issue focuses entirely on the "What" and the "Why" (User story, learner pain point, and high-level solution). It does *not* include deep technical implementation details.
3. Maintainers, mentors, and reviewers discuss the idea with the intern directly in the Issue thread.

### Step 2: Approval & Assignment
1. Once the idea is validated, a maintainer labels the issue as `approved` and assigns it to the intern.
2. If the idea is rejected or deferred, the issue is closed, saving the intern from writing wasted code.

### Step 3: The Implementation (Single PR for RFC + Code)
1. The intern creates a branch and writes the **RFC Document** (`docs/rfcs/<module>/000X-feature-name.md`) detailing the data schema, UI mockups, and technical decisions.
2. The intern implements the MVP code.
3. The intern opens **ONE dedicated Pull Request** containing both the RFC document and the MVP code implementation.

### Step 4: Iteration and Merge
1. Reviewers evaluate the PR. Because the core idea was already approved in the Issue, this review focuses on code quality, architecture (via the RFC), and UI alignment.
2. The intern iterates on the code and RFC based on feedback within the PR until it is merge-ready.
3. Once approved, the PR is merged, adding both the code to the app and the finalized RFC to the `docs/rfcs/` archive.


