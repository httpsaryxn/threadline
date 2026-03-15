import NewOrgForm from '@/components/NewOrgForm';

export default function NewOrgPage() {
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
        <a href="/dashboard" style={{ fontSize: '12px', color: '#777788', textDecoration: 'none' }}>← Back</a>
        <h1 style={{
          marginTop: '16px',
          fontWeight: 800,
          fontSize: '22px',
          background: 'linear-gradient(135deg, #A78BFA, #EC4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          New Community
        </h1>
        <p style={{ color: '#777788', fontSize: '13px', marginBottom: '28px' }}>
          Create a community for your users to chat in.
        </p>
        <NewOrgForm />
      </div>
    </div>
  );
}
