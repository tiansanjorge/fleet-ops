import { Header } from "@/shared/ui/Header";
import { AuthHydrator } from "@/core/auth/AuthHydrator";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <AuthHydrator />
      <Header />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
