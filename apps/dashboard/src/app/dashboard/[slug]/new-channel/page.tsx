import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NewChannelForm from '@/components/NewChannelForm';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function NewChannelPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: org } = await supabase
    .from('orgs')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (!org) redirect('/dashboard');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: '#111118',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '440px',
      }}>
        <a href={`/dashboard/${slug}`} style={{ fontSize: '12px', color: '#777788', textDecoration: 'none' }}>
          ← Back to {org.name}
        </a>
        <h1 style={{
          marginTop: '16px',
          fontWeight: 800,
          fontSize: '22px',
          background: 'linear-gradient(135deg, #A78BFA, #EC4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          New Channel
        </h1>
        <p style={{ color: '#777788', fontSize: '13px', marginBottom: '28px' }}>
          Add a channel to <strong style={{ color: '#F0F0FF' }}>{org.name}</strong>
        </p>
        <NewChannelForm orgId={org.id} orgSlug={org.slug} />
      </div>
    </div>
  );
}
