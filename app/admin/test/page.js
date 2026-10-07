// ============================================================
// WHAT THIS FILE DOES
// Next.js REQUIRES the name page.js to create the route /admin/test.
// So this file only points to the real code, which is in
// ConnectionCheckPage.js (same folder). Open that file to make changes.
// ============================================================

export const dynamic = "force-dynamic"; // run the check fresh every time
export { default } from "./ConnectionCheckPage";