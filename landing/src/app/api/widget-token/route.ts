import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { createClient } from '@/lib/supabase/server';
import { extractWidgetCredentials, validateWidgetCredentials } from '@/lib/widgetAuth';

const SECRET = new TextEncoder().encode(
  process.env.THREADLINE_SECRET ?? 'dev_secret_key_must_be_32_chars_min'
);

// POST /api/widget-token
// Body: { org_id, username, display_name? }
// Returns: { token } — a short-lived JWT the widget uses to authenticate as a member
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const creds = extractWidgetCredentials(request, body);
    const orgId = creds.orgId;
    const username =
      typeof body.username === 'string'
        ? body.username
        : typeof body.userName === 'string'
          ? body.userName
          : undefined;
    const displayName =
      typeof body.display_name === 'string'
        ? body.display_name
        : typeof body.displayName === 'string'
          ? body.displayName
          : undefined;

    const validation = validateWidgetCredentials(orgId, creds.apiKey);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: validation.status });
    }

    if (!orgId || !username) {
      return NextResponse.json(
        { error: 'org_id and username are required' },
        { status: 400 }
      );
    }

    if (process.env.THREADLINE_DEMO_MODE === 'true') {
      const memberId = `demo_${orgId}_${username}`;
      const token = await new SignJWT({
        sub: memberId,
        org_id: orgId,
        username,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(SECRET);

      return NextResponse.json({ token, member_id: memberId });
    }

    const supabase = await createClient();

    // Upsert the member in that org
    const { data: member, error: memberError } = await supabase
      .from('members')
      .upsert(
        { org_id: orgId, username, display_name: displayName ?? username },
        { onConflict: 'org_id,username', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (memberError) throw memberError;

    // Issue a signed JWT valid for 24 hours
    const token = await new SignJWT({
      sub: member.id,
      org_id: member.org_id,
      username: member.username,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(SECRET);

    return NextResponse.json({ token, member_id: member.id });
  } catch (err) {
    console.error('[POST /api/widget-token]', err);
    return NextResponse.json(
      { error: 'Failed to issue widget token' },
      { status: 500 }
    );
  }
}
