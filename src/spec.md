# Specification

## Summary
**Goal:** Fix admin sign-in so admins can reliably authenticate and access the admin dashboard after Internet Identity login.

**Planned changes:**
- Update backend admin authentication to work end-to-end: successful `adminLogin(adminName, adminPassword)` grants admin permissions for the caller principal so `isCurrentSessionAdmin()` returns `true`.
- Trim leading/trailing whitespace from `adminName` and `adminPassword` in the backend before validating credentials.
- Adjust backend initialization `_initializeAccessControlWithSecret` to not trap or block admin login when the app is loaded without a `caffeineAdminToken` URL parameter (empty/missing token).
- Improve the admin sign-in UI to show clear, non-secret-revealing error messages for invalid credentials vs authorization/initialization failures (including backend traps).

**User-visible outcome:** Admins can sign in with Internet Identity, enter admin credentials successfully to access admin-only actions, and see clear guidance when admin sign-in fails.
