'use client';

import { createOrg } from '@/app/actions';
import { useState } from 'react';

export default function NewOrgForm() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  function handleNameChange(val: string) {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  }

  return (
    <form action={createOrg} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={labelStyle}>Community Name</label>
        <input
          name="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Acme Corp"
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Slug <span style={{ color: '#555566', fontWeight: 400 }}>(URL identifier)</span></label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder="acme-corp"
          required
          pattern="[a-z0-9-]+"
          style={inputStyle}
        />
        {slug && (
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#777788' }}>
            Accessible at /dashboard/{slug}
          </p>
        )}
      </div>
      <button
        type="submit"
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          padding: '12px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: '4px',
        }}
      >
        Create Community
      </button>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#AAAACC',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  padding: '11px 14px',
  fontSize: '14px',
  color: '#F0F0FF',
  outline: 'none',
  boxSizing: 'border-box',
};
