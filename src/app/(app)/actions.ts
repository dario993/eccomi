"use server";

import { revalidatePath } from "next/cache";
import { setPresent } from "@/lib/attendance";
import { todayZurich } from "@/lib/dates";
import { requireAuth } from "@/lib/session";

// The date is always computed on the server: the client never chooses the day.
export async function togglePresence(volunteerId: number, present: boolean): Promise<void> {
  await requireAuth();
  await setPresent(volunteerId, todayZurich(), present);
  revalidatePath("/");
}
