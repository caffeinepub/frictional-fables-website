# Specification

## Summary
**Goal:** Preserve uploaded books, related content, and user profiles across normal canister upgrades/redeploys so data is not lost during code updates.

**Planned changes:**
- Update backend storage so all persisted entities (uploaded books + assets and other already-supported stored content) survive normal canister upgrades.
- Update backend user profile storage so profiles remain saved and admin visibility workflows still work after upgrades.
- Ensure existing read/query methods continue to return previously saved data after an upgrade.

**User-visible outcome:** After the backend is upgraded/redeployed, previously uploaded books (including metadata, files, and covers), other stored site content, and user profiles remain available and readable as before.
