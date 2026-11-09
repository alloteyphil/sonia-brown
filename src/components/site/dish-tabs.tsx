"use client";
import Image from "next/image";
import * as Tabs from "@radix-ui/react-tabs";
import type { Dish } from "@/brand/content";
import { tabList, tabPill } from "./menu-tabs";

type Cuisine = { id: string; label: string; dishes: Dish[]; more: string[] };

/** Signature dishes, one tab per cuisine, each with an "also on request" list. */
export function DishTabs({ cuisines }: { cuisines: Cuisine[] }) {
  return (
    <Tabs.Root defaultValue={cuisines[0].id} className="mt-10">
      <Tabs.List aria-label="Dishes by cuisine" className={tabList}>
        {cuisines.map((c) => (
          <Tabs.Trigger key={c.id} value={c.id} className={tabPill}>
            {c.label} <span className="ml-1 font-normal opacity-70">{c.dishes.length}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {cuisines.map((c) => (
        <Tabs.Content key={c.id} value={c.id} className="dish-tabs-panel mt-8 focus-visible:outline-none">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.dishes.map((d) => (
              <li key={d.name} className="group overflow-hidden rounded-[var(--radius-card)] border border-horizon bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(11,34,57,0.35)]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={d.image} alt={d.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.06]" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl">{d.name}</h3>
                  <p className="mt-2 text-muted">{d.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-[var(--radius-card)] bg-sky-mist/60 p-6 sm:p-7">
            <h3 className="text-xl">Also on request</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {c.more.map((d) => (
                <li key={d} className="rounded-full bg-white px-3.5 py-1.5 text-[15px] text-night-sky ring-1 ring-horizon">{d}</li>
              ))}
            </ul>
          </div>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
