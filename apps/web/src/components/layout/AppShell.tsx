import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1280px] px-6 py-8">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
