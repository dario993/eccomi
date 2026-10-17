import { BottomNav } from "@/components/BottomNav";
import { requireAuth } from "@/lib/session";
import { logout } from "../login/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return (
    <>
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 pt-5">
        <span className="text-xl font-bold tracking-[-0.03em] text-blue">Eccomi</span>
        <form action={logout}>
          <button className="h-11 px-2 text-base text-muted">Esci</button>
        </form>
      </header>
      <main className="mx-auto max-w-2xl px-5 pb-28 pt-6">{children}</main>
      <BottomNav />
    </>
  );
}
