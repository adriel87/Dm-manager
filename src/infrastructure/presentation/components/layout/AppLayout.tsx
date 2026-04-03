import { Sidebar } from '@/infrastructure/presentation/components/layout/Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Server Component shell that composes the sidebar and main content area.
 * The Sidebar is a Client Component island — only it re-renders on navigation
 * for active-link detection. The rest of the shell is static.
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <Sidebar />

      {/* Offset main content by sidebar width */}
      <main
        className="flex-1 ml-60 min-h-screen overflow-y-auto"
        id="main-content"
      >
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
