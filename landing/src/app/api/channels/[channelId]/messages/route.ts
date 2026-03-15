import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractWidgetCredentials, validateWidgetCredentials } from '@/lib/widgetAuth';

// GET /api/channels/[channelId]/messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;
    const supabase = await createClient();

    const creds = extractWidgetCredentials(req);
    const validation = validateWidgetCredentials(creds.orgId, creds.apiKey);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: validation.status });
    }

    if (process.env.THREADLINE_DEMO_MODE === 'true') {
      return NextResponse.json({
        messages: [
          {
            id: `${channelId}_1`,
            content: 'Welcome to ThreadLine demo 👋',
            edited: false,
            created_at: new Date().toISOString(),
            member: { id: 'demo_admin', username: 'admin', display_name: 'Admin', avatar_url: null },
          },
          {
            id: `${channelId}_2`,
            content: 'This is sample data from demo mode.',
            edited: false,
            created_at: new Date().toISOString(),
            member: { id: 'demo_employee', username: 'employee', display_name: 'Employee', avatar_url: null },
          },
        ],
      });
    }

    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id, org_id')
      .eq('id', channelId)
      .single();

    if (channelError || !channel || channel.org_id !== creds.orgId) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, content, edited, created_at, updated_at,
        member:members(id, username, display_name, avatar_url)
      `)
      .eq('channel_id', channelId)
      .is('parent_id', null)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ messages: data });
  } catch (err) {
    console.error('[GET /api/channels/:id/messages]', err);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/channels/[channelId]/messages
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;
    const body = await req.json();
    const { content, member_id } = body;

    const creds = extractWidgetCredentials(req, body);
    const validation = validateWidgetCredentials(creds.orgId, creds.apiKey);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: validation.status });
    }

    if (!content || !member_id) {
      return NextResponse.json({ error: 'content and member_id are required' }, { status: 400 });
    }

    if (process.env.THREADLINE_DEMO_MODE === 'true') {
      return NextResponse.json(
        {
          message: {
            id: `demo_${Date.now()}`,
            content,
            edited: false,
            created_at: new Date().toISOString(),
            member: { id: member_id, username: 'demo-user', display_name: 'Demo User', avatar_url: null },
          },
        },
        { status: 201 }
      );
    }

    const supabase = await createClient();

    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id, org_id')
      .eq('id', channelId)
      .single();

    if (channelError || !channel || channel.org_id !== creds.orgId) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, org_id')
      .eq('id', member_id)
      .single();

    if (memberError || !member || member.org_id !== creds.orgId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({ channel_id: channelId, member_id, content })
      .select(`
        id, content, edited, created_at,
        member:members(id, username, display_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return NextResponse.json({ message: data }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/channels/:id/messages]', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
