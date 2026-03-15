'use client';

import { ThreadLineWidget } from 'threadline-widget';

export default function DemoWidgetMount() {
  const orgId = process.env.NEXT_PUBLIC_THREADLINE_DEMO_ORG_ID;
  const apiKey = process.env.NEXT_PUBLIC_THREADLINE_DEMO_API_KEY;
  const adminUsername = process.env.NEXT_PUBLIC_THREADLINE_DEMO_ADMIN_USERNAME;
  const adminPassword = process.env.NEXT_PUBLIC_THREADLINE_DEMO_ADMIN_PASSWORD;

  if (!orgId || !apiKey || !adminUsername || !adminPassword) {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
        Demo widget is disabled. Set NEXT_PUBLIC_THREADLINE_DEMO_ORG_ID,
        NEXT_PUBLIC_THREADLINE_DEMO_API_KEY,
        NEXT_PUBLIC_THREADLINE_DEMO_ADMIN_USERNAME,
        and NEXT_PUBLIC_THREADLINE_DEMO_ADMIN_PASSWORD in landing/.env.local.
      </div>
    );
  }

  return (
    <ThreadLineWidget
      orgId={orgId}
      apiKey={apiKey}
      adminUsername={adminUsername}
      adminPassword={adminPassword}
    />
  );
}
