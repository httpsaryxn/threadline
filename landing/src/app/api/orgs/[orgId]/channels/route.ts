import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractWidgetCredentials, validateWidgetCredentials } from '@/lib/widgetAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const creds = extractWidgetCredentials(request, { orgId });
    const validation = validateWidgetCredentials(creds.orgId, creds.apiKey);

    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: validation.status });
    }

    if (process.env.THREADLINE_DEMO_MODE === 'true') {
      return NextResponse.json({
        channels: [
          { id: `${orgId}_general`, name: 'general', slug: 'general', description: 'General updates' },
          { id: `${orgId}_frontend`, name: 'frontend', slug: 'frontend', description: 'Frontend room' },
          { id: `${orgId}_design`, name: 'design', slug: 'design', description: 'Design discussions' },
        ],
      });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('channels')
      .select('id, name, slug, description, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ channels: data ?? [] });
  } catch (err) {
    console.error('[GET /api/orgs/:orgId/channels]', err);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}
