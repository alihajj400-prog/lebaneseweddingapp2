import { WebsiteHeader } from './WebsiteHeader';
import { WebsiteFooter } from './WebsiteFooter';

interface WebsiteLayoutProps {
  children: React.ReactNode;
}

export function WebsiteLayout({ children }: WebsiteLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <WebsiteHeader />
      <main className="flex-1 pt-16">{children}</main>
      <WebsiteFooter />
    </div>
  );
}
