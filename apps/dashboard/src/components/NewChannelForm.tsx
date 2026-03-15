'use client';

import { createChannel } from '@/app/actions';
import { useState } from 'react';

interface Props {
  orgId: string;
  orgSlug: string;
}

export default function NewChannelForm({ orgId, orgSlug }: Props) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  function handleNameChange(val: string) {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  }

  return (
    <form action={createChannel} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <input type="hidden" name="orgId" value={orgId} />
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <div>
        <label style={labelStyle}>Channel Name</label>
        <input
          name="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="general"
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Slug</label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder="general"
          required
          pattern="[a-z0-9-]+"
          style={inputStyle}
        />
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
        Create Channel
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
