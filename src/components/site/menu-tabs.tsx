"use client";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowRight } from "lucide-react";
import { menuSlug, type SampleMenu } from "@/brand/content";

export const tabList = "-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0";
export const tabPill =
  "shrink-0 rounded-full px-4 py-2 text-[15px] font-semibold text-night-sky/75 ring-1 ring-horizon transition hover:bg-white data-[state=active]:bg-harbour data-[state=active]:text-white data-[state=active]:ring-harbour";

type Group = { slug: string; name: string; menus: SampleMenu[] };

/** Sample menus with one tab per service, so phones aren't scrolling through every menu. */
export function MenuTabs({ groups }: { groups: Group[] }) {
  if (groups.length === 0) return null;
  return (
    <Tabs.Root defaultValue={groups[0].slug} className="mt-10">
      <Tabs.List aria-label="Menus by service" className={tabList}>
        {groups.map((g) => (
          <Tabs.Trigger
            key={g.slug}
            value={g.slug}
            className={tabPill}
          >
            {g.name} <span className="ml-1 font-normal opacity-70">{g.menus.length}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {groups.map((g) => (
        <Tabs.Content key={g.slug} value={g.slug} className="mt-6 focus-visible:outline-none">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {g.menus.map((m) => (
              <article key={m.title} className="flex flex-col rounded-[var(--radius-card)] border border-horizon bg-white p-7">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-2xl">{m.title}</h3>
                  {m.tag && <span className="rounded-full bg-sky-mist px-3 py-1 text-sm font-medium text-harbour-deep">{m.tag}</span>}
                </div>
                <ol className="mt-5 flex-1 space-y-3">
                  {m.courses.map((c) => (
                    <li key={c} className="flex gap-3 text-night-sky/85">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky" aria-hidden />
                      {c}
                    </li>
                  ))}
                </ol>
                <div className="mt-6 border-t border-horizon pt-4">
                  <Link
                    href={`/book?service=${g.slug}&menu=${menuSlug(m.title)}`}
                    className="inline-flex items-center gap-1 font-semibold text-harbour hover:underline"
                    aria-label={`Start a booking from the ${m.title} menu`}
                  >
                    Start from this menu <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
