import { AccountSidebar } from "@/components/shop/account/AccountSidebar";
import { StorefrontNavBar } from "@/components/shop/layout/StorefrontNavBar";
import { StorefrontFooter } from "@/components/shop/layout/StorefrontFooter";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF8] dark:bg-[#09090b]">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-accent/10 dark:from-accent/5 to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-[#d4b483]/10 dark:from-[#d4b483]/5 to-transparent rounded-full blur-3xl opacity-50" />
      </div>

      <StorefrontNavBar />

      <main className="flex-1 mt-24 relative z-10">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Sidebar Navigation */}
            <AccountSidebar />

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
