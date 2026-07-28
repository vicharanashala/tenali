# Feature Proposal Review Process for Tenali (RFC-Based)

As interns and parallel feature work scale up, we need a structured way to discuss and review feature ideas before implementation, ensuring proposals are well documented and visible to everyone working on related modules.

This proposal outlines a **Git-tracked RFC workflow inside the Tenali repository**.

---

## Proposed Workflow

1. Proposals live in the main Tenali repository under `docs/rfcs/`, with one folder per module to mirror the existing codebase structure:
   ```
   docs/rfcs/
     hcf/
     lcm/
     fractions/
     decimals/
     indices/
     ...
   ```
2. Before implementation, an intern adds an RFC (`docs/rfcs/<module>/000X-feature-name.md`) covering the feature, motivation, design, affected components, and open questions using a shared template for consistency.
3. The intern opens a **PR containing only the RFC** without code, keeping the initial review focused strictly on design.
4. Discussion happens in the PR comments where anyone working on the same module can discover, review, and contribute.
5. Once agreed upon, the RFC PR is merged. Implementation begins only after approval.
6. The implementation PR references the approved RFC (e.g., `Implements docs/rfcs/hcf/0003-visual-gcd-explainer.md`), creating a clear link in the project history.
7. If implementation details evolve during development, the intern updates the RFC in the same PR or a follow-up PR to maintain an accurate design record.

---

## Tracking

- A **GitHub Project board** (or labels like `type:rfc` and `module:hcf`) on the repository tracks status.
- Workflow columns: **Draft → Needs Review → Changes Requested → Approved → Implementing → Completed**.
- Filtering by the `type:rfc` label provides a live view of active proposals alongside code reviews.

---

## Key Benefits

1. **Structured Documentation**: Every feature starts with an RFC in the repository, making design rationale easy to find and reference.
2. **Improved Visibility**: Interns can review related proposals early, reducing duplicate work and encouraging early feedback.
3. **Integrated Workflow**: Keeps documentation and code in one place, making it easier for new contributors to get oriented.
4. **Traceability**: The RFC and its implementation share the git history, ensuring design context stays connected to the code.
5. **Familiar Process**: Reuses standard PR creation and review habits that contributors already use.
