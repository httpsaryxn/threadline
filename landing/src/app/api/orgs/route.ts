import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, slug, logo_url, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ organizations: data });
  } catch (err) {
    console.error('[GET /api/orgs]', err);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('organizations')
      .insert({ name, slug })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ organization: data }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/orgs]', err);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}
