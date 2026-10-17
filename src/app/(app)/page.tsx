import Link from "next/link";
import { AttendanceList } from "@/components/AttendanceList";
import { presentIds } from "@/lib/attendance";
import { formatDateIt, todayZurich } from "@/lib/dates";
import { requireAuth } from "@/lib/session";
import { listVolunteers } from "@/lib/volunteers";

export default async function PresenzePage() {
  await requireAuth();
  const today = todayZurich();
  const [volunteers, present] = await Promise.all([listVolunteers({ activeOnly: true }), presentIds(today)]);
  return (
    <>
      <h1 className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] first-letter:uppercase">
        {formatDateIt(today, "long")}
      </h1>
      {volunteers.length === 0 ? (
        <p className="mt-4 text-lg">
          Nessun volontario attivo.{" "}
          <Link href="/volontari" className="font-semibold text-blue underline">
            Aggiungi i volontari
          </Link>
        </p>
      ) : (
        <AttendanceList volunteers={volunteers} presentIds={[...present]} />
      )}
    </>
  );
}
