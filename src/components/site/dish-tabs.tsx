"use client";
import { useState } from "react";
import Image from "next/image";
import * as Tabs from "@radix-ui/react-tabs";
import type { Dish } from "@/brand/content";
import { cn } from "@/lib/utils";
import { tabList, tabTrigger } from "./menu-tabs";

type Cuisine = { id: string; label: string; dishes: Dish[]; more: string[] };

/** Signature dishes, one tab per cuisine, each with an "also on request" list. */
export function DishTabs({ cuisines }: { cuisines: Cuisine[] }) {
  return (
    <Tabs.Root defaultValue={cuisines[0].id} className="mt-8">
      <Tabs.List aria-label="Dishes by cuisine" className={tabList}>
        {cuisines.map((c) => (
          <Tabs.Trigger key={c.id} value={c.id} className={tabTrigger}>
            {c.label} <span className="ml-1 font-normal tabular-nums text-muted">{c.dishes.length}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {cuisines.map((c) => (
        <Tabs.Content key={c.id} value={c.id} className="tabs-panel focus-visible:outline-none">
          <DishMenu dishes={c.dishes} more={c.more} />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

/**
 * Reads like a menu: names and descriptions in a list. On wide screens one
 * large photo follows the dish you point at; on phones each dish has its own
 * small photo.
 */
function DishMenu({ dishes, more }: { dishes: Dish[]; more: string[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="grid gap-x-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div>
        <ul className="divide-y divide-horizon border-b border-horizon">
          {dishes.map((d, i) => (
            <li key={d.name}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-pressed={active === i}
                className="flex w-full items-start gap-4 py-4 text-left"
              >
                <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-raised lg:hidden">
                  <Image src={d.image} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <span className="flex-1">
                  <span className={cn("block font-display text-xl transition-colors duration-150", active === i && "lg:text-harbour")}>{d.name}</span>
                  <span className="mt-1 block text-muted">{d.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[15px] text-muted">
          <span className="font-medium text-night-sky">Also on request:</span> {more.join(", ").toLowerCase()}
        </p>
      </div>
      <div className="hidden lg:block">
        <figure className="sticky top-24 pt-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-raised">
            {dishes.map((d, i) => (
              <Image
                key={d.image}
                src={d.image}
                alt={i === active ? d.alt : ""}
                aria-hidden={i !== active}
                fill
                sizes="(min-width: 1024px) 560px, 0px"
                className={cn("object-cover transition-opacity duration-300", i === active ? "opacity-100" : "opacity-0")}
              />
            ))}
          </div>
          <figcaption className="mt-3 text-sm text-muted">{dishes[active].name}</figcaption>
        </figure>
      </div>
    </div>
  );
}
