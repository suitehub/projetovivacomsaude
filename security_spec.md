# Security Specification & Threat Model

## 1. Data Invariants

1. **User Identity & PII Isolation**:
   - Every document under `/users/{userId}` contains personal data (name, email, phone, address).
   - Read and write access is strictly limited to the authenticated user whose `request.auth.uid == userId` or an authenticated administrator with verified email.
   - Blanket reads (`allow read: if isSignedIn()`) are strictly forbidden to prevent customer data scraping.
   - An authenticated user cannot create or modify a profile with an `id` or `email` that belongs to someone else (`incoming().id == userId` and `incoming().id == request.auth.uid`).

2. **Parent Document & Subcollection Ownership**:
   - Favorites in `/users/{userId}/favorites/{productId}` inherit the Master Gate: access requires `request.auth.uid == userId`.
   - Users cannot inject favorites into another user's subcollection or tamper with foreign bookmarked items.
   - The document ID `{productId}` must satisfy `isValidId()`.

3. **Store Settings Invariance**:
   - `/settings/store` provides public operational data (phone, WhatsApp, announcements, location).
   - Read is public (`allow read: if true;`).
   - Create, update, and delete are strictly restricted to verified administrators (`isAdmin()`).

4. **Administrative Integrity & Privilege Escalation Guard**:
   - Auth tokens never provide client-modifiable roles.
   - Administrators are verified against `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` or the bootstrapped verified root admin `rickyjorgecastro@gmail.com`.
   - Regular users cannot write to `/admins/{adminId}` or elevate their own privileges.

5. **Payload Bounding & Anti-Denial-of-Wallet**:
   - All string fields have explicit `.size()` boundaries (e.g., fullName <= 120, email <= 120, phone <= 30).
   - Document paths have strict regex and size checks via `isValidId()`.

---

## 2. The "Dirty Dozen" Payloads (Designed to Fail)

1. **Spoofed User Registration**: Attacker `user_hacker` attempts to create `/users/victim_123` with `id: "victim_123"` to overwrite or impersonate a legitimate user.
   - *Expected*: `PERMISSION_DENIED`.

2. **Cross-User Profile Read**: Attacker `user_hacker` attempts to read `/users/victim_123` directly.
   - *Expected*: `PERMISSION_DENIED`.

3. **Blanket User Listing**: Attacker queries the entire `/users` collection without a restrictive `userId` filter.
   - *Expected*: `PERMISSION_DENIED`.

4. **Self-Promotion to Admin**: Non-admin user attempts to write to `/admins/user_hacker` with `role: "admin"`.
   - *Expected*: `PERMISSION_DENIED`.

5. **Store Settings Defacement**: Unauthenticated or normal customer attempts to update `/settings/store` to change the WhatsApp payment number.
   - *Expected*: `PERMISSION_DENIED`.

6. **Oversized String Injection (Denial of Wallet)**: User attempts to update their profile `fullName` with a 200KB junk text string.
   - *Expected*: `PERMISSION_DENIED`.

7. **Ghost Field / Shadow Field Injection**: User attempts to update profile with `{ role: "admin", isSuperUser: true }` in `/users/{userId}`.
   - *Expected*: `PERMISSION_DENIED`.

8. **Unverified Email Admin Spoof**: User with `email: "rickyjorgecastro@gmail.com"` but `email_verified: false` attempts to write to `/settings/store`.
   - *Expected*: `PERMISSION_DENIED`.

9. **Foreign Favorites Subcollection Write**: User `user_hacker` attempts to add a favorite in `/users/victim_123/favorites/prod-1`.
   - *Expected*: `PERMISSION_DENIED`.

10. **Path Traversal / Malformed Document ID**: Attacker attempts to create `/users/../../../etc/passwd` or an ID longer than 128 characters.
    - *Expected*: `PERMISSION_DENIED`.

11. **Immutable Field Tampering**: User attempts to mutate their original `createdAt` timestamp during a profile update.
    - *Expected*: `PERMISSION_DENIED`.

12. **Anonymous Write Exploit**: An unauthenticated guest attempts to modify or delete any user document or favorite.
    - *Expected*: `PERMISSION_DENIED`.

---

## 3. Test Runner Specification

Test runner implemented in `firestore.rules.test.ts` validates that all 12 payloads are unequivocally rejected, and legitimate authenticated operations (owner read/write of profile, owner manage favorites, public store read) are allowed.
