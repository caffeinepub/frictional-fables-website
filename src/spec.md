# Specification

## Summary
**Goal:** Allow logged-out visitors (and logged-in users with incomplete profiles) to read Suggestions and Forum content, while keeping posting actions restricted to authenticated users with complete profiles.

**Planned changes:**
- Update backend access control to allow anonymous/incomplete-profile read queries for the Suggestions feed and Forum threads (including replies), while keeping create/thread/reply actions gated behind authentication + complete profile.
- Adjust frontend Suggestions and Forum pages so they can fetch and render content without depending on a successful profile fetch (no blocking login/profile modal for reading).
- Make the shared frontend profile query resilient when logged out by treating authorization failures as an unauthenticated state (non-blocking), while still refetching on login to gate posting actions.

**User-visible outcome:** Visitors can browse Suggestions and Forum threads/replies while logged out; attempting to submit a suggestion, create a thread, or reply still requires logging in and having a complete profile.
