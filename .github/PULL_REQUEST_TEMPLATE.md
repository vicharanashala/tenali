## Description
<!-- Provide a clear and concise summary of the changes introduced by this Pull Request. -->

## Related Issue(s)
<!-- Link to the issue(s) this PR addresses (e.g., Closes #123). Unlinked PRs are rejected. -->
Closes #

## PR Target Branch Confirmation
- [ ] This PR targets the `demo` branch (not `main`).

## Contributor Checklist
- [ ] My PR targets the `demo` branch (canonical upstream default for contributions).
- [ ] My PR closes an approved issue (`Closes #N`).
- [ ] I have run client tests (`cd client && npm test`) and verified they pass.
- [ ] I have run BKT unit tests (`node server/lib/bkt.test.js`) and verified they pass.
- [ ] I have checked ESLint (`cd client && npm run lint`) and did not introduce new errors.
- [ ] I have verified the production build succeeds (`cd client && npm run build`).
- [ ] I have manually tested these changes in the browser (see testing instructions below).
- [ ] I have avoided modifying `client/src/App.jsx` or `server/index.js` unless explicitly assigned.
- [ ] My changes do not render hardcoded fallback data as if it were live production data.
- [ ] If this PR introduces a major feature, an approved RFC exists in `docs/rfcs/`.

## Testing Instructions
<!-- Provide step-by-step instructions for a reviewer to manually verify your changes locally. -->
1. Run `cd client && npm run dev` (and `cd server && npm start` if backend routes are involved).
2. Navigate to `http://localhost:5173/...`
3. Verify:
   - ...

## Screenshots / Screen Recordings (if applicable)
<!-- Drag and drop images or recordings here for any UI changes -->
