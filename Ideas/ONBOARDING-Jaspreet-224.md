# Onboarding Document: Issue #224

**Title:** Remove the Linear Algebra Lab from the Main Branch Frontend

**Author:** Jaspreet (GitHub: Jaspreet-j)  
**Repository:** vicharanashala/tenali  
**Pull Request:** #538  
**Related Issue:** #221  
**Issue:** #224

## 1. Issue Summary

Issue #224 focuses on removing the Linear Algebra Lab from the frontend of the main branch.

The Linear Algebra Lab is being moved to its own branch, where it will be served at `tenali.fun/matrixmystics` using port 4004.

Since the lab will be available separately, it should no longer be accessible through the main branch frontend.

This issue is related to issue #221, which makes MatrixMysticsApp the landing view on the new branch.

The main objective is to remove the old lab components and their frontend connections while keeping the other Linear Algebra quiz topics working.

The following modules must remain available:

- Vectors
- Dot Products
- Matrices

These modules continue to work under `/summership` and populate the Linear Algebra card.

## 2. Problem Analysis

The Linear Algebra Lab was connected to the main frontend through different components and routes.

The main component file, `LinearAlgebraApp.jsx`, was approximately 325 KB, making it one of the largest frontend files.

Keeping this code in the main branch would create unnecessary code duplication because the lab is now being moved to a separate branch.

The following frontend connections needed to be removed:

- Linear Algebra tile from `features/tiles.js`.
- `linearalgebra` and `missionquiz` entries from the `modeMap` in `App.jsx`.
- `/linearalgebra` and `/la` routes.
- Unused `MatrixMysticsApp` component.
- Unnecessary imports of LinearAlgebraApp and its CSS file.

Removing these references ensures that the main frontend no longer provides access to the old Linear Algebra Lab.

## 3. What I Changed

The issue requires the following frontend changes:

**1. client/src/features/tiles.js**
- Remove the Linear Algebra Lab tile.
- Keep the remaining quiz topics available.

**2. client/src/App.jsx**
- Remove the `linearalgebra` and `missionquiz` entries from `modeMap`.
- Remove the `/linearalgebra` and `/la` routes.
- Remove the unused `MatrixMysticsApp` component.
- Remove the import of LinearAlgebraApp.

**3. client/src/LinearAlgebraApp.jsx**
- Delete the old Linear Algebra Lab component file.

**4. client/src/LinearAlgebraApp.css**
- Delete the CSS file associated with the removed lab.

**Important:**
The following modules are deliberately kept unchanged:

- Vectors
- Dot Products
- Matrices

They remain available under `/summership`.

No backend changes are required for issue #224. Backend removal is handled separately under issue #225.

*Note: Confirm that these changes match the files included in your implementation and PR #538.*

## 4. Testing and Verification

The following checks are specified for verifying the changes:

1. Run the frontend build:

   `cd client`

   `npm run build`

2. Search for remaining references:

   `grep -r "LinearAlgebraApp" client/src`

   Expected result: No matching references.

3. Check the frontend routes:
   - `/linearalgebra` should fall through to the main grid.
   - `/la` should no longer open the old lab.

4. Check the Linear Algebra card:
   - Vectors should remain available.
   - Dot Products should remain available.
   - Matrices should remain available.

**Testing Results:** Fill in the actual commands executed and their results before submitting this document.

The client does not currently have a configured test runner. The server's Vitest suite is separate and is not required for this frontend-only change.

## 5. How This Relates to Issue #221

Both issues are part of moving the Matrix Mystics and Linear Algebra Lab functionality to a separate branch.

**Issue #221:**
- Makes MatrixMysticsApp the landing view on the new branch.
- Adds the required frontend configuration.
- Allows the lab to work independently.

**Issue #224:**
- Removes the old Linear Algebra Lab from the main branch frontend.
- Removes unused components, imports and routes.
- Keeps the remaining quiz modules available.

Together, these changes ensure that the Linear Algebra Lab is maintained separately while the main branch continues to support the other quiz topics.

The backend API `matrixmystics-api` remains unchanged in this issue.

## 6. Problems Faced and How I Solved Them

The following points describe important development considerations:

**1. Branch Management**

A separate Git branch is used for the onboarding document so that documentation changes remain independent of the original code changes.

**2. Avoiding Unnecessary Changes**

Only the required frontend files should be modified. The Vectors, Dot Products and Matrices modules must remain unchanged.

**3. Git Staging**

Only the intended documentation file should be staged and committed. Unrelated files should not be included in the Pull Request.

**4. Verification**

The frontend build and reference search help verify that the removed component is no longer connected to the main frontend.

## 7. Git Workflow Followed

1. Checked the repository and existing branches.
2. Created a separate branch for the onboarding documentation.
3. Prepared the Markdown documentation inside the `Ideas` folder.
4. Staged only the intended onboarding document.
5. Committed the changes with a meaningful commit message.
6. Pushed the branch to the GitHub fork (`origin`).
7. Created a Pull Request against the original repository.

## 8. What I Learned

Through this issue, I learned:

1. How to remove an unused frontend feature without affecting other working modules.
2. How frontend components, imports, routes and mode mappings are connected.
3. Why it is important to check for unused references after removing a component.
4. How separate Git branches help maintain different versions of an application.
5. How to verify frontend changes using build commands and source-code searches.

## 9. Links

- **Issue #224:** https://github.com/vicharanashala/tenali/issues/224
- **Pull Request #538:** https://github.com/vicharanashala/tenali/pull/538
- **Related Issue #221:** https://github.com/vicharanashala/tenali/issues/221
- **Repository:** https://github.com/vicharanashala/tenali

## 10. Status

**Issue:** #224

**Pull Request:** #538

**Documentation:** Prepared for submission.

**PR Status:** Verify the current status on GitHub (Open, Merged or Changes Requested).

**Date:** 27 November 2026