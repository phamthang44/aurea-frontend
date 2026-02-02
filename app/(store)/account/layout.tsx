import { AccountSidebar } from "@/components/shop/account/AccountSidebar";
import { StorefrontNavBar } from "@/components/shop/layout/StorefrontNavBar";
import { StorefrontFooter } from "@/components/shop/layout/StorefrontFooter";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Subtle ambient gradients - luxury feel */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-accent/[0.03] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-accent/[0.02] to-transparent rounded-full blur-3xl" />
      </div>

      <StorefrontNavBar />

      <main className="flex-1 mt-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Sidebar Navigation */}
            <AccountSidebar />

            {/* Vertical Divider - Desktop only */}
            <div className="hidden lg:block w-px bg-border/20 self-stretch" />

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
