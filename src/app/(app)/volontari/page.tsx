import { requireAuth } from "@/lib/session";
import { listVolunteers } from "@/lib/volunteers";
import { AddVolunteerForm, ImportForm } from "./VolunteerForms";
import { VolunteerRow } from "./VolunteerRow";

export default async function VolontariPage() {
  await requireAuth();
  const volunteers = await listVolunteers();
  const active = volunteers.filter((v) => v.active).length;
  return (
    <>
      <h1 className="text-4xl font-bold tracking-[-0.03em]">Volontari</h1>
      <p className="mt-2 text-lg text-muted">
        {volunteers.length === 0
          ? "Nessun volontario. Aggiungili qui sotto o incolla un elenco."
          : `${active} attivi su ${volunteers.length}. Tocca un nome per modificarlo.`}
      </p>
      <section className="mt-8 flex flex-col gap-3">
        <AddVolunteerForm />
        <ImportForm />
      </section>
      <ul className="mt-10 flex flex-col gap-1">
        {volunteers.map((v) => <VolunteerRow key={v.id} v={v} />)}
      </ul>
    </>
  );
}
