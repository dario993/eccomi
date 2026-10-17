"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Presenze" },
  { href: "/volontari", label: "Volontari" },
  { href: "/riepilogo", label: "Riepilogo" },
] as const;

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 bg-ink pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid max-w-2xl grid-cols-3">
        {LINKS.map(({ href, label }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 items-center justify-center text-base font-medium ${
                  active ? "bg-blue text-white" : "text-white/70"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
