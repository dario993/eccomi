import { requireAuth } from "@/lib/session";
import { listGroups } from "@/lib/groups";
import { listVolunteers } from "@/lib/volunteers";
import { GroupsPanel } from "./GroupsPanel";
import { AddVolunteerForm, ImportForm } from "./VolunteerForms";
import { VolunteerList } from "./VolunteerList";

export default async function VolontariPage() {
  await requireAuth();
  const [volunteers, groups] = await Promise.all([listVolunteers(), listGroups()]);
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
        <GroupsPanel groups={groups} />
      </section>
      <VolunteerList volunteers={volunteers} groups={groups} />
    </>
  );
}
