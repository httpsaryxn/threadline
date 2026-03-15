import { useEffect, useMemo, useState } from 'react';

export interface ThreadLineWidgetProps {
  orgId: string;
  apiKey: string;
  adminUsername: string;
  adminPassword: string;
  apiBaseUrl?: string;
}

type Role = 'admin' | 'moderator' | 'employee';
type View = 'chat' | 'workspaces' | 'rooms' | 'members' | 'roles';

type Channel = {
  id: string;
  name: string;
  slug: string;
};

type Message = {
  id: string;
  content: string;
  created_at: string;
  member?: {
    username?: string;
    display_name?: string;
  };
};

type Workspace = {
  id: string;
  name: string;
  description: string;
  roomCount: number;
};

type Member = {
  id: string;
  username: string;
  role: Role;
  password: string;
};

const INVALID_WIDGET_CONFIG_MESSAGE =
  'Invalid ThreadLine configuration. Please contact your administrator.';

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  moderator: 'Moderator',
  employee: 'Employee',
};

function buildDefaultWorkspaces(channels: Channel[]): Workspace[] {
  const primaryCount = Math.max(channels.length, 1);
  return [
    {
      id: 'workspace_company_hub',
      name: 'Company Hub',
      description: 'Main organization workspace',
      roomCount: primaryCount,
    },
  ];
}

function seedMembers(adminUsername: string): Member[] {
  return [
    { id: 'member_admin', username: adminUsername, role: 'admin', password: '1234' },
    { id: 'member_mod', username: 'moderator', role: 'moderator', password: '1234' },
    { id: 'member_emp', username: 'employee', role: 'employee', password: '1234' },
  ];
}

function randomPassword() {
  return Math.random().toString(36).slice(2, 10);
}

export function ThreadLineWidget({
  orgId,
  apiKey,
  adminUsername,
  adminPassword,
  apiBaseUrl = '',
}: ThreadLineWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('admin');
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [activeView, setActiveView] = useState<View>('chat');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [memberId, setMemberId] = useState<string | null>(null);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [members, setMembers] = useState<Member[]>(() => seedMembers(adminUsername));

  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<Role>('employee');

  const [configState, setConfigState] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [error, setError] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  const activeChannel = useMemo(
    () => channels.find((channel) => channel.id === activeChannelId),
    [channels, activeChannelId]
  );

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      'x-threadline-org-id': orgId,
      'x-threadline-api-key': apiKey,
    }),
    [orgId, apiKey]
  );

  const navItems = useMemo(() => {
    if (activeRole === 'admin') {
      return [
        { key: 'chat' as const, label: 'Chat' },
        { key: 'workspaces' as const, label: 'Workspaces' },
        { key: 'members' as const, label: 'Members' },
        { key: 'roles' as const, label: 'Roles' },
      ];
    }

    if (activeRole === 'moderator') {
      return [
        { key: 'chat' as const, label: 'Chat' },
        { key: 'workspaces' as const, label: 'Workspaces' },
        { key: 'rooms' as const, label: 'Rooms' },
        { key: 'members' as const, label: 'Members' },
      ];
    }

    return [
      { key: 'chat' as const, label: 'Chat' },
      { key: 'workspaces' as const, label: 'My Workspaces' },
    ];
  }, [activeRole]);

  useEffect(() => {
    async function validateConfiguration() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/widget/validate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ orgId, apiKey }),
        });

        if (!response.ok) {
          setConfigState('invalid');
          return;
        }

        setConfigState('valid');
      } catch {
        setConfigState('invalid');
      }
    }

    validateConfiguration();
  }, [apiBaseUrl, headers, orgId, apiKey]);

  useEffect(() => {
    if (!memberId || !activeChannelId || configState !== 'valid') return;

    async function fetchMessages() {
      setLoadingMessages(true);
      try {
        const response = await fetch(`${apiBaseUrl}/api/channels/${activeChannelId}/messages`, {
          headers,
        });
        const json = await response.json();
        setMessages(Array.isArray(json.messages) ? json.messages : []);
      } catch {
        setError('Failed to load messages.');
      } finally {
        setLoadingMessages(false);
      }
    }

    fetchMessages();
  }, [activeChannelId, apiBaseUrl, configState, headers, memberId]);

  async function loadChannels() {
    const response = await fetch(`${apiBaseUrl}/api/orgs/${orgId}/channels`, {
      headers,
    });

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(json.error || 'Failed to load channels');
    }

    const json = await response.json();
    const nextChannels = Array.isArray(json.channels) ? (json.channels as Channel[]) : [];
    setChannels(nextChannels);
    setWorkspaces(buildDefaultWorkspaces(nextChannels));

    if (nextChannels.length > 0) {
      setActiveChannelId(nextChannels[0].id);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (configState !== 'valid') {
      setError(INVALID_WIDGET_CONFIG_MESSAGE);
      return;
    }

    const loginName = selectedRole === 'admin' ? adminUsername : username.trim();

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }

    if (selectedRole === 'admin') {
      if (username.trim() !== adminUsername || password !== adminPassword) {
        setError('Invalid admin credentials.');
        return;
      }
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/widget-token`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orgId,
          apiKey,
          username: loginName,
          displayName: loginName,
        }),
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json.error || 'Unable to login');
      }

      setMemberId(json.member_id as string);
      setActiveRole(selectedRole);
      setActiveView('chat');
      await loadChannels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!memberId || !activeChannelId || !messageInput.trim()) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/channels/${activeChannelId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content,
          member_id: memberId,
          orgId,
          apiKey,
        }),
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json.error || 'Failed to send message');
      }

      if (json.message) {
        setMessages((prev) => [...prev, json.message as Message]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }

  function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    const name = newWorkspaceName.trim();
    if (!name) return;

    setWorkspaces((prev) => [
      ...prev,
      {
        id: `workspace_${Date.now()}`,
        name,
        description: newWorkspaceDescription.trim() || 'Created by moderator/admin',
        roomCount: 0,
      },
    ]);
    setNewWorkspaceName('');
    setNewWorkspaceDescription('');
  }

  function handleCreateMember(e: React.FormEvent) {
    e.preventDefault();
    const candidate = newMemberUsername.trim();
    if (!candidate) return;

    if (members.some((member) => member.username.toLowerCase() === candidate.toLowerCase())) {
      setError('Member username already exists.');
      return;
    }

    const generatedPassword = randomPassword();

    setMembers((prev) => [
      ...prev,
      {
        id: `member_${Date.now()}`,
        username: candidate,
        role: newMemberRole,
        password: generatedPassword,
      },
    ]);

    setError('');
    setNewMemberUsername('');
    setNewMemberRole('employee');
  }

  function updateMemberRole(memberIdToUpdate: string, nextRole: Role) {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberIdToUpdate ? { ...member, role: nextRole } : member
      )
    );
  }

  function handleLogout() {
    setMemberId(null);
    setActiveRole(null);
    setMessages([]);
    setChannels([]);
    setWorkspaces([]);
    setActiveChannelId(null);
    setUsername('');
    setPassword('');
    setError('');
  }

  function renderLogin() {
    return (
      <div style={loginShellStyle}>
        <h2 style={loginTitleStyle}>ThreadLine Access</h2>
        <p style={mutedTextStyle}>Choose your role and sign in.</p>

        <form onSubmit={handleLogin} style={stackStyle}>
          <div style={roleSwitchStyle}>
            {(['admin', 'moderator', 'employee'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                style={selectedRole === role ? activeRoleStyle : roleButtonStyle}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>

          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder={`${ROLE_LABELS[selectedRole]} username`}
            style={inputStyle}
            autoComplete="username"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={`${ROLE_LABELS[selectedRole]} password`}
            style={inputStyle}
            autoComplete="current-password"
            required
          />

          {error && <p style={errorTextStyle}>{error}</p>}

          <button type="submit" style={primaryButtonStyle}>
            Continue to {ROLE_LABELS[selectedRole]} Workspace
          </button>
        </form>
      </div>
    );
  }

  function renderChatView() {
    return (
      <div style={chatShellStyle}>
        <aside style={chatChannelListStyle}>
          <p style={sectionLabelStyle}>Rooms</p>
          {channels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              onClick={() => setActiveChannelId(channel.id)}
              style={channel.id === activeChannelId ? activeNavButtonStyle : navButtonStyle}
            >
              # {channel.name}
            </button>
          ))}
          {channels.length === 0 && <p style={mutedTextStyle}>No rooms available.</p>}
        </aside>

        <section style={chatMainStyle}>
          <div style={chatHeaderStyle}>
            <h3 style={viewTitleStyle}>#{activeChannel?.slug ?? 'select-room'}</h3>
          </div>

          <div style={messagesContainerStyle}>
            {loadingMessages && <p style={mutedTextStyle}>Loading messages...</p>}
            {!loadingMessages && messages.length === 0 && (
              <p style={mutedTextStyle}>No messages yet. Start the conversation.</p>
            )}
            {messages.map((message) => (
              <div key={message.id} style={messageStyle}>
                <p style={messageMetaStyle}>
                  {message.member?.display_name || message.member?.username || 'User'}
                </p>
                <p style={messageTextStyle}>{message.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} style={composerStyle}>
            <input
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
              placeholder={activeChannel ? `Message #${activeChannel.slug}` : 'Select a room'}
              style={inputStyle}
              disabled={!activeChannelId}
            />
            <button type="submit" style={sendButtonStyle} disabled={!activeChannelId}>
              Send
            </button>
          </form>
        </section>
      </div>
    );
  }

  function renderWorkspacesView() {
    const canManage = activeRole === 'admin' || activeRole === 'moderator';

    return (
      <div style={viewStackStyle}>
        <h3 style={viewTitleStyle}>Workspaces</h3>
        <p style={mutedTextStyle}>Department-level spaces that contain collaboration rooms.</p>

        <div style={cardGridStyle}>
          {workspaces.map((workspace) => (
            <div key={workspace.id} style={cardStyle}>
              <p style={cardTitleStyle}>{workspace.name}</p>
              <p style={cardDescriptionStyle}>{workspace.description}</p>
              <p style={cardMetaStyle}>{workspace.roomCount} rooms</p>
            </div>
          ))}
        </div>

        {canManage && (
          <form onSubmit={handleCreateWorkspace} style={formCardStyle}>
            <p style={cardTitleStyle}>Create workspace</p>
            <input
              value={newWorkspaceName}
              onChange={(event) => setNewWorkspaceName(event.target.value)}
              placeholder="Workspace name"
              style={inputStyle}
            />
            <input
              value={newWorkspaceDescription}
              onChange={(event) => setNewWorkspaceDescription(event.target.value)}
              placeholder="Description"
              style={inputStyle}
            />
            <button type="submit" style={primaryButtonStyle}>Create Workspace</button>
          </form>
        )}
      </div>
    );
  }

  function renderRoomsView() {
    return (
      <div style={viewStackStyle}>
        <h3 style={viewTitleStyle}>Room Moderation</h3>
        <p style={mutedTextStyle}>Moderators can manage room behavior and conversation health.</p>
        <div style={formCardStyle}>
          {channels.map((channel) => (
            <div key={channel.id} style={rowStyle}>
              <div>
                <p style={cardTitleStyle}>#{channel.slug}</p>
                <p style={cardDescriptionStyle}>Room visible to assigned workspace members.</p>
              </div>
              <button type="button" style={secondaryButtonStyle}>Moderate</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderMembersView() {
    const canCreate = activeRole === 'admin';

    return (
      <div style={viewStackStyle}>
        <h3 style={viewTitleStyle}>Members</h3>
        <p style={mutedTextStyle}>Invite people and assign access roles.</p>

        <div style={formCardStyle}>
          {members.map((member) => (
            <div key={member.id} style={rowStyle}>
              <div>
                <p style={cardTitleStyle}>{member.username}</p>
                <p style={cardMetaStyle}>Password: {member.password}</p>
              </div>
              <span style={roleBadgeStyle}>{ROLE_LABELS[member.role]}</span>
            </div>
          ))}
        </div>

        {canCreate && (
          <form onSubmit={handleCreateMember} style={formCardStyle}>
            <p style={cardTitleStyle}>Create employee/moderator</p>
            <input
              value={newMemberUsername}
              onChange={(event) => setNewMemberUsername(event.target.value)}
              placeholder="Username"
              style={inputStyle}
            />
            <select
              value={newMemberRole}
              onChange={(event) => setNewMemberRole(event.target.value as Role)}
              style={selectStyle}
            >
              <option value="employee">Employee</option>
              <option value="moderator">Moderator</option>
            </select>
            <button type="submit" style={primaryButtonStyle}>Create Member</button>
          </form>
        )}
      </div>
    );
  }

  function renderRolesView() {
    return (
      <div style={viewStackStyle}>
        <h3 style={viewTitleStyle}>Role Management</h3>
        <p style={mutedTextStyle}>Admin controls permissions and role assignment.</p>

        <div style={formCardStyle}>
          {members.map((member) => (
            <div key={member.id} style={rowStyle}>
              <p style={cardTitleStyle}>{member.username}</p>
              <select
                value={member.role}
                onChange={(event) => updateMemberRole(member.id, event.target.value as Role)}
                style={selectStyle}
              >
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="employee">Employee</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderMainView() {
    if (activeView === 'workspaces') return renderWorkspacesView();
    if (activeView === 'rooms') return renderRoomsView();
    if (activeView === 'members') return renderMembersView();
    if (activeView === 'roles') return renderRolesView();
    return renderChatView();
  }

  return (
    <div style={rootStyle}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        style={toggleButtonStyle}
      >
        {isOpen ? 'Close ThreadLine' : 'Open ThreadLine'}
      </button>

      {isOpen && (
        <div style={windowStyle}>
          <header style={windowHeaderStyle}>
            <div>
              <p style={brandTextStyle}>ThreadLine</p>
              <p style={headerSubTextStyle}>Embeddable internal communication platform</p>
            </div>
            <div style={headerActionsStyle}>
              {activeRole && <span style={roleBadgeStyle}>{ROLE_LABELS[activeRole]}</span>}
              {memberId && (
                <button type="button" onClick={handleLogout} style={secondaryButtonStyle}>
                  Sign out
                </button>
              )}
              <button type="button" onClick={() => setIsOpen(false)} style={secondaryButtonStyle}>
                Close
              </button>
            </div>
          </header>

          {configState === 'checking' && <p style={mutedTextStyle}>Validating configuration...</p>}

          {configState === 'invalid' && (
            <p style={errorTextStyle}>{INVALID_WIDGET_CONFIG_MESSAGE}</p>
          )}

          {configState === 'valid' && !memberId && renderLogin()}

          {configState === 'valid' && memberId && (
            <div style={appShellStyle}>
              <aside style={sidebarStyle}>
                <p style={sectionLabelStyle}>Navigation</p>
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveView(item.key)}
                    style={activeView === item.key ? activeNavButtonStyle : navButtonStyle}
                  >
                    {item.label}
                  </button>
                ))}
              </aside>

              <main style={mainAreaStyle}>{renderMainView()}</main>
            </div>
          )}

          {error && memberId && <p style={errorTextStyle}>{error}</p>}
        </div>
      )}
    </div>
  );
}

const rootStyle: React.CSSProperties = {
  position: 'fixed',
  right: '20px',
  bottom: '20px',
  zIndex: 2147483000,
  fontFamily: 'Inter, system-ui, sans-serif',
};

const toggleButtonStyle: React.CSSProperties = {
  background: '#111827',
  color: '#FFFFFF',
  border: '1px solid #374151',
  borderRadius: '12px',
  padding: '12px 16px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
};

const windowStyle: React.CSSProperties = {
  position: 'fixed',
  inset: '24px',
  maxWidth: '1100px',
  margin: '0 auto',
  background: '#0B1020',
  border: '1px solid #1F2937',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  color: '#E5E7EB',
  overflow: 'hidden',
};

const windowHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 18px',
  borderBottom: '1px solid #1F2937',
  background: '#0A132A',
};

const brandTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '16px',
  fontWeight: 700,
};

const headerSubTextStyle: React.CSSProperties = {
  margin: '2px 0 0',
  fontSize: '12px',
  color: '#9CA3AF',
};

const headerActionsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const loginShellStyle: React.CSSProperties = {
  margin: '22px auto',
  width: '100%',
  maxWidth: '460px',
  background: '#0E172E',
  border: '1px solid #1F2937',
  borderRadius: '14px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const loginTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '20px',
};

const appShellStyle: React.CSSProperties = {
  flex: 1,
  display: 'grid',
  gridTemplateColumns: '220px 1fr',
  minHeight: 0,
};

const sidebarStyle: React.CSSProperties = {
  borderRight: '1px solid #1F2937',
  background: '#0C1428',
  padding: '14px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const mainAreaStyle: React.CSSProperties = {
  minHeight: 0,
  overflow: 'auto',
  padding: '16px',
};

const stackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const roleSwitchStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '8px',
};

const roleButtonStyle: React.CSSProperties = {
  background: '#111827',
  color: '#9CA3AF',
  border: '1px solid #374151',
  borderRadius: '8px',
  padding: '8px 10px',
  cursor: 'pointer',
  fontSize: '12px',
};

const activeRoleStyle: React.CSSProperties = {
  ...roleButtonStyle,
  color: '#FFFFFF',
  border: '1px solid #6366F1',
};

const navButtonStyle: React.CSSProperties = {
  textAlign: 'left',
  border: '1px solid #1F2937',
  borderRadius: '8px',
  background: '#0F172A',
  color: '#D1D5DB',
  padding: '8px 10px',
  cursor: 'pointer',
  fontSize: '13px',
};

const activeNavButtonStyle: React.CSSProperties = {
  ...navButtonStyle,
  background: '#1E293B',
  border: '1px solid #6366F1',
  color: '#FFFFFF',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #374151',
  background: '#0F172A',
  color: '#FFFFFF',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: 'none',
  background: '#4F46E5',
  color: '#FFFFFF',
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  border: '1px solid #374151',
  borderRadius: '8px',
  background: '#111827',
  color: '#D1D5DB',
  fontSize: '12px',
  padding: '8px 10px',
  cursor: 'pointer',
};

const sendButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  width: '120px',
};

const chatShellStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '220px 1fr',
  gap: '12px',
  minHeight: 'calc(100vh - 180px)',
};

const chatChannelListStyle: React.CSSProperties = {
  border: '1px solid #1F2937',
  borderRadius: '10px',
  padding: '10px',
  background: '#0E172E',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const chatMainStyle: React.CSSProperties = {
  border: '1px solid #1F2937',
  borderRadius: '10px',
  background: '#0E172E',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
};

const chatHeaderStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderBottom: '1px solid #1F2937',
};

const messagesContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const messageStyle: React.CSSProperties = {
  background: '#0F172A',
  border: '1px solid #1F2937',
  borderRadius: '8px',
  padding: '8px',
};

const messageMetaStyle: React.CSSProperties = {
  margin: 0,
  color: '#93C5FD',
  fontSize: '11px',
};

const messageTextStyle: React.CSSProperties = {
  margin: '4px 0 0',
  color: '#E5E7EB',
  fontSize: '13px',
  wordBreak: 'break-word',
};

const composerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  padding: '12px',
  borderTop: '1px solid #1F2937',
};

const viewStackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const viewTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '18px',
};

const sectionLabelStyle: React.CSSProperties = {
  margin: '0 0 4px',
  color: '#9CA3AF',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const cardGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '10px',
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #1F2937',
  background: '#0E172E',
  borderRadius: '10px',
  padding: '12px',
};

const formCardStyle: React.CSSProperties = {
  border: '1px solid #1F2937',
  background: '#0E172E',
  borderRadius: '10px',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  borderBottom: '1px solid #1F2937',
  paddingBottom: '10px',
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  fontWeight: 600,
};

const cardDescriptionStyle: React.CSSProperties = {
  margin: '3px 0 0',
  fontSize: '12px',
  color: '#9CA3AF',
};

const cardMetaStyle: React.CSSProperties = {
  margin: '3px 0 0',
  fontSize: '12px',
  color: '#C4B5FD',
};

const roleBadgeStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#E5E7EB',
  border: '1px solid #4B5563',
  borderRadius: '999px',
  padding: '4px 10px',
  textTransform: 'capitalize',
};

const mutedTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#9CA3AF',
  fontSize: '13px',
};

const errorTextStyle: React.CSSProperties = {
  margin: '0 16px 12px',
  color: '#FCA5A5',
  fontSize: '13px',
};
