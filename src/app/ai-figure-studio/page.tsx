import { redirect } from "next/navigation";

// The old raster-first Studio has been retired. All figure work happens on
// the unified Home → Workspace flow now. Anyone hitting this URL (old links,
// bookmarks, browser cache) gets bounced to the new home.
export default function RetiredStudioRedirect() {
  redirect("/");
}
