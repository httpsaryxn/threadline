import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch organizations where this user is a member
  const { data: memberships } = await supabase
    .from('org_members')
    .select('org_id, role, orgs(id, name, slug)')
    .eq('user_id', user.id);

  const orgs = memberships?.map((m: any) => ({ ...m.orgs, role: m.role })) ?? [];

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F0F0FF' }}>
      {/* Header */}
      <header
        style={{
          background: '#0E0E14',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1 style={{ fontWeight: 700, fontSize: '18px', background: 'linear-gradient(135deg, #A78BFA, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ThreadLine
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#777788' }}>{user.email}</span>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              style={{ fontSize: '12px', color: '#A78BFA', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '48px auto', padding: '0 24px' }}>
        {/* Page heading */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '24px', margin: 0 }}>Your Communities</h2>
            <p style={{ color: '#777788', fontSize: '14px', marginTop: '4px' }}>
              Manage channels, roles, and members
            </p>
          </div>
          <Link
            href="/dashboard/new"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            + New Community
          </Link>
        </div>

        {/* Org grid */}
        {orgs.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 24px',
              background: '#111118',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>No communities yet</h3>
            <p style={{ color: '#777788', marginBottom: '24px', fontSize: '14px' }}>
              Create your first community and embed it in your product.
            </p>
            <Link
              href="/dashboard/new"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Create community
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {orgs.map((org: any) => (
              <Link
                key={org.id}
                href={`/dashboard/${org.slug}`}
                style={{
                  display: 'block',
                  background: '#111118',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '18px',
                    marginBottom: '12px',
                    color: 'white',
                  }}
                >
                  {org.name?.[0]?.toUpperCase()}
                </div>
                <h3 style={{ fontWeight: 600, fontSize: '16px', margin: '0 0 4px 0' }}>{org.name}</h3>
                <p style={{ color: '#777788', fontSize: '12px', margin: 0 }}>/{org.slug}</p>
                <div
                  style={{
                    marginTop: '12px',
                    padding: '4px 8px',
                    background: 'rgba(124,58,237,0.15)',
                    borderRadius: '6px',
                    display: 'inline-block',
                    fontSize: '11px',
                    color: '#A78BFA',
                    textTransform: 'capitalize',
                  }}
                >
                  {org.role}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
