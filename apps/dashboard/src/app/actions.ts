'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createOrg(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;

  if (!name || !slug) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: org, error } = await supabase
    .from('orgs')
    .insert({ name, slug })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Make creator the owner
  await supabase.from('org_members').insert({
    org_id: org.id,
    user_id: user.id,
    role: 'owner',
  });

  redirect(`/dashboard/${slug}`);
}

export async function createChannel(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const orgId = formData.get('orgId') as string;
  const orgSlug = formData.get('orgSlug') as string;

  if (!name || !slug || !orgId) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  await supabase.from('channels').insert({ name, slug, org_id: orgId });
  redirect(`/dashboard/${orgSlug}?channel=${slug}`);
}
