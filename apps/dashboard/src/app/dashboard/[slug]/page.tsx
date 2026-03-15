import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import ChannelView from '@/components/ChannelView';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ channel?: string }>;
}

export default async function OrgPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { channel: channelSlug } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Get org by slug
  const { data: org } = await supabase
    .from('orgs')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (!org) notFound();

  // Check membership
  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0F', color: '#F0F0FF' }}>
        <p>You don&apos;t have access to this community.</p>
      </div>
    );
  }

  // Get channels
  const { data: channels } = await supabase
    .from('channels')
    .select('id, name, slug, description')
    .eq('org_id', org.id)
    .order('name');

  const defaultChannel = channels?.[0];
  const activeChannelSlug = channelSlug || defaultChannel?.slug;
  const activeChannel = channels?.find((c: any) => c.slug === activeChannelSlug) || defaultChannel;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0A0A0F' }}>
      {/* Top nav */}
      <header style={{
        background: '#0E0E14',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 20px',
        height: '54px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a href="/dashboard" style={{ fontSize: '12px', color: '#777788', textDecoration: 'none' }}>← Back</a>
          <span style={{ color: '#333', fontSize: '14px' }}>|</span>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '13px', color: 'white',
          }}>
            {org.name[0].toUpperCase()}
          </div>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>{org.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href={`/dashboard/${slug}/settings`}
            style={{ fontSize: '12px', color: '#A78BFA', textDecoration: 'none' }}
          >
            ⚙ Settings
          </a>
          <span style={{ fontSize: '12px', color: '#777788' }}>{user.email}</span>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{
          width: '220px',
          background: '#0E0E14',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 12px 8px', fontSize: '11px', fontWeight: 600, color: '#777788', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Channels
          </div>
          <nav style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px' }}>
            {(channels ?? []).map((ch: any) => (
              <a
                key={ch.id}
                href={`/dashboard/${slug}?channel=${ch.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  color: ch.slug === activeChannelSlug ? '#A78BFA' : '#AAAACC',
                  background: ch.slug === activeChannelSlug ? 'rgba(124,58,237,0.15)' : 'transparent',
                  marginBottom: '2px',
                  fontWeight: ch.slug === activeChannelSlug ? 600 : 400,
                  transition: 'background 0.15s ease',
                }}
              >
                <span style={{ opacity: 0.6 }}>#</span>
                {ch.name}
              </a>
            ))}
            {(channels ?? []).length === 0 && (
              <p style={{ color: '#555566', fontSize: '12px', padding: '8px 10px' }}>
                No channels yet
              </p>
            )}
          </nav>
          <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <a
              href={`/dashboard/${slug}/new-channel`}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '7px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#A78BFA',
                border: '1px solid rgba(124,58,237,0.3)',
                textDecoration: 'none',
                background: 'rgba(124,58,237,0.08)',
              }}
            >
              + Add Channel
            </a>
          </div>
        </aside>

        {/* Channel content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeChannel ? (
            <ChannelView
              channel={activeChannel}
              orgId={org.id}
              userId={user.id}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777788' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>📭</div>
                <p>No channels yet. Create one to get started.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
