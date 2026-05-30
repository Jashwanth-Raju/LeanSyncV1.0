# LeanSync — Briefing for Claude

## What this app is
A digital Value Stream Mapping (VSM) tool for Lean manufacturing. Teams map their shop floor process on a canvas, enter KPI values per step, and get live analytics (bottlenecks, value-added ratio, OEE, lead time).

Live URL: https://leansync-demo.web.app
GitHub: https://github.com/Jashwanth-Raju/LeanSyncV1.0

## Critical rules — read before touching anything

### 1. Always read before editing
Never edit a file you haven't read in this conversation. Read it first, every time.

### 2. The duplicate file problem
Every file has both a `.tsx`/`.ts` source AND a `.js` compiled counterpart in src/.
**Edit only `.tsx`/`.ts` files.** The `.js` files are compiled outputs accidentally tracked in git.
Exception: if the fix is a logic bug (not just types/UI), also apply it to the `.js` counterpart.

### 3. The real Whiteboard file
- `src/Whiteboard.tsx` — the REAL running component (2200+ lines). Edit this.
- `src/Whiteboard.jsx` and `src/Whiteboard.js` — OLD unused versions. Never edit these.

### 4. Deploy sequence
```
npm run build      ← always build first
firebase deploy    ← then deploy
```
Never deploy without building. `npm run dev` does NOT update the dist/ folder.

## Key files

| File | What it does |
|---|---|
| `src/Whiteboard.tsx` | Main canvas, scenario tabs, save logic, node renderer, all UI |
| `src/whiteboard/data.ts` | Node library + default KPI values + inspector field list |
| `src/whiteboard/types.ts` | All TypeScript types |
| `src/whiteboard/components/InspectorPanel.tsx` | Node property editor (3 tabs: Times, Flow & OEE, Other) |
| `src/whiteboard/components/QuickFillModal.tsx` | Quick Fill table — reads all canvas nodes dynamically |
| `src/whiteboard/components/DashboardOverlay.tsx` | KPI cards on canvas |
| `src/whiteboard/components/AnalyticsPanel.tsx` | Full analytics panel |
| `src/lib/ProjectContext.tsx` | Project CRUD + Firebase queries |
| `src/firebase.ts` | Firebase init (credentials hardcoded — known issue) |

## Firestore data structure
```
projects/{id}/vsmState/scenarios/current|future|whatIf → { nodes, edges }
projects/{id} → { name, industryProfile, ownerId, memberIds }
users/{id} → { selectedProjectId }
projects/{id}/memberships/{userId} → { role }
projects/{id}/presence/{userId} → { lastActive }
```

## What has been built
- Sheet Metal & Machining node library (8 nodes with default KPIs)
- OEE fields (oeeAvailability, oeePerformance, oeeQuality) with live computed OEE % on nodes
- Bottleneck highlighting — highest cycle time node gets red glow + "⚠ Bottleneck" badge
- Inspector tabs — Times / Flow & OEE / Other
- Quick Fill modal — table of all canvas nodes with inline editing
- Unified bottom action bar — undo, redo, delete, save status
- acceptInvite bug fixed — was wiping all project members on invite accept

## Known issues (do not re-introduce fixes for these)
- Firebase credentials hardcoded in src/firebase.ts (not yet moved to .env)
- deleteProject does not cascade delete subcollections
- Duplicate .js + .tsx files in src/ (legacy, clean up carefully)

## Pilot company context
Sheet metal manufacturer with CNC machines, lathes, cutting, press/forming, welding, stores, QC, maintenance. Knows basic VSM. Needs daily KPI value from the tool.

## User
Jashwanth is a fresher/beginner. Teach step by step. Wait for confirmation at each step. Explain why, not just what. Always connect technical decisions to how the pilot company will experience them.
