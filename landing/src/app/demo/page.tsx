import Link from 'next/link';
import DemoWidgetMount from '@/components/DemoWidgetMount';

export default function DemoPage() {
  return (
    <main className="min-h-screen gradient-bg text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Demo <span className="gradient-text">Company Portal</span>
          </h1>
          <Link href="/" className="text-sm text-gray-300 hover:text-white">
            ← Back to landing
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          <section className="glass-card rounded-2xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold mb-2">Acme Internal Portal</h2>
            <p className="text-sm text-gray-400 mb-6">
              This dummy portal page is used during hackathon demos. Mount the widget here to showcase
              embedded chat inside a real product screen.
            </p>

            <div className="rounded-xl border border-dashed border-purple-500/40 bg-black/20 p-6 min-h-72 flex items-center justify-center text-center">
              <div>
                <p className="text-sm text-purple-300 font-medium mb-2">Live widget loaded</p>
                <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                  Use the floating ThreadLine button at bottom-right to open the chat panel.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <DemoWidgetMount />
            </div>
          </section>

          <aside className="glass-card rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold mb-3">Demo credentials</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Org ID: from your Supabase org record</li>
              <li>API Key: from THREADLINE_API_KEYS_JSON mapping</li>
              <li>Admin username/password: widget props</li>
            </ul>
            <p className="text-xs text-gray-400 mt-5 leading-relaxed">
              Required endpoint headers:
              <br />
              x-threadline-org-id + x-threadline-api-key
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
