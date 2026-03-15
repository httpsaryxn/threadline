import { NextResponse } from 'next/server';
import {
  extractWidgetCredentials,
  validateWidgetCredentials,
  INVALID_WIDGET_CONFIG_MESSAGE,
} from '@/lib/widgetAuth';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const { orgId, apiKey } = extractWidgetCredentials(request, body);
    const validation = validateWidgetCredentials(orgId, apiKey);

    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.message || INVALID_WIDGET_CONFIG_MESSAGE },
        { status: validation.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/widget/validate]', err);
    return NextResponse.json({ error: INVALID_WIDGET_CONFIG_MESSAGE }, { status: 500 });
  }
}
