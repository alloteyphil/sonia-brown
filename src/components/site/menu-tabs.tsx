"use client";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { menuSlug, type SampleMenu } from "@/brand/content";

export const tabList = "-mx-5 flex gap-7 overflow-x-auto border-b border-horizon px-5 sm:mx-0 sm:px-0";
export const tabTrigger =
  "-mb-px shrink-0 border-b-2 border-transparent pb-3 pt-1 text-[15px] font-medium text-muted transition-colors duration-150 hover:text-night-sky data-[state=active]:border-harbour data-[state=active]:text-night-sky";

type Group = { slug: string; name: string; menus: SampleMenu[] };

/** Sample menus with one tab per service, so phones aren't scrolling through every menu. */
export function MenuTabs({ groups }: { groups: Group[] }) {
  if (groups.length === 0) return null;
  return (
    <Tabs.Root defaultValue={groups[0].slug} className="mt-8">
      <Tabs.List aria-label="Menus by service" className={tabList}>
        {groups.map((g) => (
          <Tabs.Trigger key={g.slug} value={g.slug} className={tabTrigger}>
            {g.name} <span className="ml-1 font-normal tabular-nums text-muted">{g.menus.length}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {groups.map((g) => (
        <Tabs.Content key={g.slug} value={g.slug} className="tabs-panel mt-8 focus-visible:outline-none">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {g.menus.map((m) => (
              <MenuCard key={m.title} menu={m} href={`/book?service=${g.slug}&menu=${menuSlug(m.title)}`} />
            ))}
          </div>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

/** A sample menu set like the card Sonia leaves on the table. */
export function MenuCard({ menu, href }: { menu: SampleMenu; href?: string }) {
  return (
    <article className="menu-card flex flex-col px-8 pb-8 pt-10 text-center">
      <h3 className="text-2xl">{menu.title}</h3>
      {menu.tag && <p className="mt-1 text-sm text-muted">{menu.tag}</p>}
      <ol className="mt-6 flex-1 text-[15px] leading-snug text-night-sky/85">
        {menu.courses.map((c, i) => (
          <li key={c}>
            {i > 0 && <span className="mx-auto my-3 block h-px w-6 bg-sky" aria-hidden />}
            <span className="text-balance">{c}</span>
          </li>
        ))}
      </ol>
      {href && (
        <Link
          href={href}
          className="mt-8 text-sm font-medium text-harbour-deep underline underline-offset-4 transition-colors hover:text-night-sky"
          aria-label={`Start a booking from the ${menu.title} menu`}
        >
          Start from this menu
        </Link>
      )}
    </article>
  );
}
