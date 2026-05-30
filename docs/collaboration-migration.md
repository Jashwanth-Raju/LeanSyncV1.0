# LeanSync Collaboration Migration Plan

## 1. Target Firestore Schema

```
projects/{projectId}
  name, industryProfile, ownerId, metadata, nodes, edges
  memberships/{userId} { role: "owner" | "editor" | "viewer" }
  invites/{inviteId} { email, role, status, createdAt, token }
  presence/{userId} { displayName, lastActive }
```

## 2. Migration Steps

1. **Read existing user projects**: iterate `users/{uid}/projects`.
2. **Copy each project** to `/projects/{projectId}` with `ownerId=uid`.
3. **Create membership doc**: `/projects/{projectId}/memberships/{uid}` with role `owner`.
4. Optionally keep a back-reference under `users/{uid}/projects` for quick lists or remove the legacy tree after verifying.
5. Update the app to read from `/projects` instead of `users/{uid}/projects` and load memberships to show only accessible projects.

## 3. Firestore Security Rules (draft)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isMember(projectId, uid) {
      return exists(/databases/$(database)/documents/projects/$(projectId)/memberships/$(uid));
    }
    function isOwner(projectId, uid) {
      return get(/databases/$(database)/documents/projects/$(projectId)/memberships/$(uid)).data.role == 'owner';
    }
    function isInvitee(projectId, inviteId) {
      return request.auth != null &&
        get(/databases/$(database)/documents/projects/$(projectId)/invites/$(inviteId)).data.email == request.auth.token.email;
    }

    match /projects/{projectId} {
      allow read: if isMember(projectId, request.auth.uid);
      allow write: if isOwner(projectId, request.auth.uid);

      match /memberships/{userId} {
        allow read: if isMember(projectId, request.auth.uid);
        allow write: if isOwner(projectId, request.auth.uid);
      }

      match /invites/{inviteId} {
        allow create: if isOwner(projectId, request.auth.uid);
        allow read: if isOwner(projectId, request.auth.uid);
        allow update: if isOwner(projectId, request.auth.uid) || isInvitee(projectId, inviteId);
      }

      match /presence/{userId} {
        allow read: if isMember(projectId, request.auth.uid);
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Helper functions (`isMember`, `isOwner`, `isInvitee`) check membership documents or invite email tokens. Adjust to your authentication strategy.

## 4. App Changes After Migration

- Update `ProjectContext` to query `/projects` where memberships contain the current user.
- Update create/delete/duplicate flows to operate on `/projects`.
- Update invite flow to write to `/projects/{id}/invites`.
- Update presence to write to `/projects/{id}/presence/{user}`.
