// ============================================================
// WHAT THIS FILE DOES
// Next.js REQUIRES the name page.js to create the route /admin.
// So this file only points to the real code, which is in
// ManageMemoriesPage.js (same folder). Open that file to make changes.
// ============================================================

export const dynamic = "force-dynamic"; // always show the latest memories
export { default } from "./ManageMemoriesPage";