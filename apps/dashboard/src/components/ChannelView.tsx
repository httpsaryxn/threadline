'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  content: string;
  created_at: string;
  metadata: any;
  user_id: string;
}

interface ChannelViewProps {
  channel: { id: string; name: string; slug: string; description?: string };
  orgId: string;
  userId: string;
}

export default function ChannelView({ channel, orgId, userId }: ChannelViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Load initial messages
  useEffect(() => {
    setLoading(true);
    supabase
      .from('messages')
      .select('id, content, created_at, metadata, user_id')
      .eq('channel_id', channel.id)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        setMessages(data ?? []);
        setLoading(false);
      });
  }, [channel.id]);

  // Realtime subscription
  useEffect(() => {
    const sub = supabase
      .channel(`messages:${channel.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channel.id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [channel.id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    const content = input.trim();
    setInput('');

    await supabase.from('messages').insert({
      channel_id: channel.id,
      org_id: orgId,
      user_id: userId,
      content,
      metadata: { sender: 'admin', displayName: 'Admin' },
    });
    setSending(false);
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#F0F0FF' }}>
      {/* Channel header */}
      <div style={{
        padding: '12px 20px',
        background: '#0A0A0F',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: '16px' }}>
          <span style={{ opacity: 0.5, marginRight: '4px' }}>#</span>
          {channel.name}
        </h2>
        {channel.description && (
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#777788' }}>{channel.description}</p>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading && (
          <p style={{ color: '#777788', textAlign: 'center', fontSize: '13px' }}>Loading messages…</p>
        )}
        {!loading && messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#555566', fontSize: '14px' }}>No messages yet. Be the first! 👋</p>
          </div>
        )}
        {messages.map((msg) => {
          const isAdmin = msg.user_id === userId;
          const displayName = msg.metadata?.displayName || (isAdmin ? 'Admin' : 'Guest');
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: isAdmin ? 'row-reverse' : 'row',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: isAdmin ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : 'linear-gradient(135deg, #374151, #1F2937)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700, flexShrink: 0,
                color: 'white',
              }}>
                {displayName[0]?.toUpperCase()}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: '65%',
                background: isAdmin ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${isAdmin ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: isAdmin ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                padding: '8px 12px',
              }}>
                <div style={{ fontSize: '11px', color: '#777788', marginBottom: '4px', fontWeight: 600 }}>
                  {displayName}
                </div>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                  {msg.content}
                </p>
                <div style={{ fontSize: '10px', color: '#555566', marginTop: '4px', textAlign: isAdmin ? 'left' : 'right' }}>
                  {formatTime(msg.created_at)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: '#0E0E14',
          display: 'flex',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message #${channel.name}`}
          disabled={sending}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#F0F0FF',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: sending || !input.trim() ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
