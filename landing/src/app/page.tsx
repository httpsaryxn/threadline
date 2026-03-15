import Link from 'next/link';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Real-time Messaging',
    desc: 'Powered by Supabase Realtime. Messages appear instantly — no polling, no delays.',
  },
  {
    icon: '📺',
    title: 'Channels & DMs',
    desc: 'Organize conversations into channels. Private DMs for 1-on-1 chats.',
  },
  {
    icon: '🎭',
    title: 'Custom Roles',
    desc: 'Color-coded roles with granular permissions. Admin, Member, Guest — your rules.',
  },
  {
    icon: '😄',
    title: 'Reactions & Threads',
    desc: 'Emoji reactions and threaded replies keep discussions organized.',
  },
  {
    icon: '🔌',
    title: '5-line Setup',
    desc: 'Drop the `<ThreadLineWidget>` component into any React/Next.js app and you\'re live.',
  },
  {
    icon: '🔒',
    title: 'Secure by Default',
    desc: 'Row-level security on every table. JWT-authenticated widget tokens.',
  },
];

const CODE_SNIPPET = `import { ThreadLineWidget } from '@threadline/sdk';

// In your component:
<ThreadLineWidget
  orgId="your-org-id"
  token={widgetToken}    // from your backend /api/widget-token
/>`;

export default function HomePage() {
  return (
    <div className="gradient-bg min-h-screen">
      {/* NAV */}
      <nav className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl bg-[#0A0A0F]/70">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold gradient-text">ThreadLine</span>
            <span className="text-xs bg-purple-700/30 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700/50">
              beta
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </a>
            <Link href="/demo" className="text-sm text-gray-400 hover:text-white transition-colors">
              Demo
            </Link>
            <a href="#contact" className="text-sm text-gray-400 hover:text-white transition-colors">
              Contact
            </a>
            <a href="#quickstart" className="text-sm text-gray-400 hover:text-white transition-colors">
              Quickstart
            </a>
            <Link
              href="/dashboard"
              className="btn-primary text-sm px-4 py-2 rounded-lg font-medium"
            >
              Dashboard →
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-20 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-purple-300 bg-purple-900/20 border border-purple-700/30 rounded-full px-4 py-2 mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full pulse-dot" />
          Open source · Self-hostable · Free during beta
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Community chat
          <br />
          <span className="gradient-text">in 5 minutes</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          ThreadLine is an embeddable Discord-style community widget. Drop it into any website,
          get real-time channels, DMs, roles, and reactions — without building a backend.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="btn-primary px-8 py-4 rounded-xl text-base font-semibold"
          >
            Start building free →
          </Link>
          <a
            href="#quickstart"
            className="px-8 py-4 rounded-xl text-base font-semibold border border-white/10 text-gray-300 hover:border-purple-500/50 hover:text-white transition-all"
          >
            See the code
          </a>
        </div>

        {/* MOCK WIDGET PREVIEW */}
        <div className="mt-20 mx-auto max-w-3xl float-anim">
          <div className="glass-card rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/20">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-gray-500 font-mono">ThreadLine widget · #general</span>
            </div>

            {/* Fake channel list + messages */}
            <div className="flex h-80">
              {/* Sidebar */}
              <div className="w-52 border-r border-white/5 p-3 flex flex-col gap-1 bg-black/10">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-1">Channels</p>
                {['# general', '# announcements', '# random', '# feedback'].map((ch, i) => (
                  <div
                    key={ch}
                    className={`px-2 py-1.5 rounded-md text-sm font-medium ${
                      i === 0 ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {ch}
                  </div>
                ))}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-1 mt-4">Direct</p>
                {['Alice', 'Bob'].map((user) => (
                  <div key={user} className="flex items-center gap-2 px-2 py-1 text-sm text-gray-400">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
                    {user}
                  </div>
                ))}
              </div>

              {/* Messages */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 space-y-4 overflow-hidden">
                  {[
                    { name: 'Alice', color: 'from-purple-500 to-indigo-500', msg: 'Hey team! Just shipped the new feature 🎉', time: '10:32 AM' },
                    { name: 'Bob', color: 'from-pink-500 to-rose-500', msg: 'Looks amazing! The UI is super clean', time: '10:33 AM' },
                    { name: 'Carol', color: 'from-green-500 to-emerald-500', msg: 'ThreadLine integration took me 10 mins 🔥', time: '10:35 AM' },
                  ].map((m) => (
                    <div key={m.name} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${m.color} flex-shrink-0 mt-0.5`} />
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-white">{m.name}</span>
                          <span className="text-xs text-gray-500">{m.time}</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-0.5">{m.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-white/5">
                  <div className="bg-white/5 rounded-lg px-3 py-2 text-sm text-gray-500 flex items-center justify-between">
                    <span>Message #general</span>
                    <span className="text-xs text-purple-400">Realtime ●</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Everything you need<br />
          <span className="gradient-text">nothing you don't</span>
        </h2>
        <p className="text-center text-gray-400 mb-16 max-w-lg mx-auto">
          ThreadLine handles the hard parts — real-time sync, auth, presence, moderation — so you ship faster.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card feature-card rounded-2xl p-6 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-purple-900/30 flex items-center justify-center text-2xl mb-4 border border-purple-700/20">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUICKSTART */}
      <section id="quickstart" className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Ship in <span className="gradient-text">5 minutes</span>
        </h2>
        <p className="text-center text-gray-400 mb-12">
          Install the SDK, add one API route, drop in the widget. Done.
        </p>

        <div className="space-y-6">
          {[
            { step: '1', label: 'Install the SDK', code: 'npm install @threadline/sdk' },
            { step: '2', label: 'Add token endpoint (Next.js)', code: '// app/api/widget-token/route.ts\n// (copy from docs — 20 lines)' },
            { step: '3', label: 'Drop in the widget', code: CODE_SNIPPET },
          ].map((s) => (
            <div key={s.step} className="glass-card rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold text-white">
                  {s.step}
                </div>
                <span className="font-medium text-white">{s.label}</span>
              </div>
              <pre className="code-block overflow-x-auto text-sm text-purple-200 bg-black/30 rounded-lg p-4 font-mono leading-6 border border-white/5">
                {s.code}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Transparent <span className="gradient-text">pricing</span>
        </h2>
        <p className="text-center text-gray-400 mb-12">
          Start free during hackathon and scale when your team is ready.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Starter', price: 'Free', notes: '1 organization, up to 25 members' },
            { name: 'Growth', price: '$29/mo', notes: 'Up to 250 members, priority support' },
            { name: 'Enterprise', price: 'Contact us', notes: 'Custom limits, SSO roadmap, SLA' },
          ].map((plan) => (
            <div key={plan.name} className="glass-card rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
              <p className="text-2xl font-bold gradient-text mb-3">{plan.price}</p>
              <p className="text-sm text-gray-400">{plan.notes}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Contact <span className="gradient-text">sales</span>
        </h2>
        <p className="text-center text-gray-400 mb-10">
          Tell us your use case and we&apos;ll help you launch ThreadLine inside your product.
        </p>
        <form className="glass-card rounded-2xl p-6 border border-white/5 grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Company name"
            className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-500"
          />
          <input
            type="email"
            placeholder="Work email"
            className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-500"
          />
          <textarea
            placeholder="What do you want to build with ThreadLine?"
            rows={4}
            className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-500"
          />
          <button type="button" className="btn-primary px-6 py-3 rounded-lg font-semibold text-sm">
            Send inquiry
          </button>
        </form>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="glass-card rounded-3xl p-12 border border-purple-700/20">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to add community<br />
            <span className="gradient-text">to your product?</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Free forever on the hobby plan. No credit card required.
          </p>
          <Link
            href="/dashboard"
            className="btn-primary inline-block px-10 py-4 rounded-xl text-base font-semibold"
          >
            Create your first community →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span className="font-semibold gradient-text">ThreadLine</span>
          <span>© {new Date().getFullYear()} ThreadLine. Open source under Apache 2.0.</span>
          <div className="flex gap-6">
            <a href="https://github.com" className="hover:text-gray-300 transition-colors">GitHub</a>
            <Link href="/demo" className="hover:text-gray-300 transition-colors">Demo</Link>
            <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
