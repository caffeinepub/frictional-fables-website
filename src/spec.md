# Specification

## Summary
**Goal:** Let authenticated admins view a read-only list of all saved user profiles (including owning Principal) from the Admin Dashboard.

**Planned changes:**
- Add a new admin-only backend query in `backend/main.mo` that returns all saved user profiles with each item containing the owning `Principal` and the full `UserProfile` fields.
- Expose the new backend query in the frontend typed actor and add a React Query hook in `frontend/src/hooks/useQueries.ts` to fetch the admin profile list with stable queryKey and graceful auth-failure handling.
- Add an Admin Dashboard “Profiles” section/tab that shows a searchable list of profiles (name, email, principal) and a detail panel for the selected profile (including all profile fields and profile picture preview when present), gated by existing `isAdmin` behavior.

**User-visible outcome:** Admins can open a “Profiles” view in the Admin Dashboard to search, select, and view full details of all saved user profiles; non-admin users cannot access this view.
