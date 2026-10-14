import React, { lazy, Suspense } from "react";
import { CozyPreview } from "./CozyPreview";
const Dashboard = lazy(() =>
  import("../dashboard/Dashboard").then((module) => ({
    default: module.Dashboard,
  })),
);
export function AppEntry() {
  const configured = Boolean(
    import.meta.env.PUBLIC_FIREBASE_API_KEY &&
      import.meta.env.PUBLIC_FIREBASE_PROJECT_ID &&
      import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN &&
      import.meta.env.PUBLIC_FIREBASE_APP_ID,
  );
  return configured ? (
    <Suspense fallback={<p role="status">おへやの準備をしています…</p>}>
      <Dashboard />
    </Suspense>
  ) : (
    <CozyPreview />
  );
}
