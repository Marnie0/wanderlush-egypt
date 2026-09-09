import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { destinations, destinationBySlug } from "@content/destinations";
import { experienceBySlug, experiencesByDestination } from "@content/experiences";
import { EgyptMap } from "@/components/ui/EgyptMap";
import { ButtonLink } from "@/components/ui/Button";
import { TripWarnings } from "./TripWarnings";
import { useTripStore } from "@/lib/trip-store";
import { dayLoadMinutes, experienceSlugsInDays, stopsFromDays, type TripDay, type TripItem, type TripWarning } from "@/lib/trip-plan";
import type { TripEstimate } from "@/lib/estimate";
import { formatDate, formatDuration, formatMoney, formatNumber, pick } from "@/lib/format";
import { cn } from "@/lib/cn";

type DragData =
  | { type: "day"; index: number }
  | { type: "item"; dayId: string }
  | { type: "dayDrop"; dayId: string };

function addDays(iso: string, days: number): Date {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Only containers of the active kind count: a day being dragged never lands
 * inside another day's list, and an item never lands on a day handle. Items
 * prefer whatever the pointer is over, then the nearest centre.
 */
const collision: CollisionDetection = (args) => {
  const type = (args.active.data.current as DragData | undefined)?.type;
  const containers = args.droppableContainers.filter((container) => {
    const data = container.data.current as DragData | undefined;
    return type === "day" ? data?.type === "day" : data?.type === "item" || data?.type === "dayDrop";
  });
  const within = pointerWithin({ ...args, droppableContainers: containers });
  if (within.length > 0) return within;
  return closestCenter({ ...args, droppableContainers: containers });
};

export function StepItinerary({ estimate, warnings }: { estimate: TripEstimate; warnings: TripWarning[] }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const days = useTripStore((state) => state.days);
  const startDate = useTripStore((state) => state.startDate);
  const currency = useTripStore((state) => state.currency);
  const moveDay = useTripStore((state) => state.moveDay);
  const moveItem = useTripStore((state) => state.moveItem);
  const [active, setActive] = useState<{ id: UniqueIdentifier; data: DragData } | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // A press and hold on a phone; a plain touch still scrolls the page.
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragStart = (event: DragStartEvent) => {
    setActive({ id: event.active.id, data: event.active.data.current as DragData });
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActive(null);
    const { active: dragged, over } = event;
    if (!over) return;
    const from = dragged.data.current as DragData;
    const to = over.data.current as DragData;
    if (from.type === "day" && to.type === "day") {
      moveDay(from.index, to.index);
      return;
    }
    if (from.type !== "item") return;
    if (to.type === "item") {
      const targetDay = days.find((day) => day.id === to.dayId);
      const index = targetDay?.items.findIndex((item) => item.id === over.id) ?? -1;
      if (targetDay && index >= 0) moveItem(String(dragged.id), targetDay.id, index);
    } else if (to.type === "dayDrop") {
      const targetDay = days.find((day) => day.id === to.dayId);
      if (targetDay) moveItem(String(dragged.id), targetDay.id, targetDay.items.length);
    }
  };

  const route = useMemo(() => stopsFromDays(days).map((stop) => stop.destinationSlug), [days]);

  if (days.length === 0) {
    return (
      <div className="border border-line bg-sand-50 px-6 py-14 text-center">
        <h2 className="font-display text-2xl text-charcoal-900">{t("builder.itinerary.emptyTitle")}</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-charcoal-600">{t("builder.itinerary.emptyBody")}</p>
        <ButtonLink to="/trip-builder?step=places" className="mt-8">
          {t("builder.itinerary.emptyAction")}
        </ButtonLink>
      </div>
    );
  }

  const activeItem = active?.data.type === "item" ? days.flatMap((d) => d.items).find((i) => i.id === active.id) : null;
  const activeDay = active?.data.type === "day" ? days.find((d) => d.id === active.id) : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl text-charcoal-900">{t("builder.itinerary.title")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{t("builder.itinerary.hint")}</p>
      </div>

      <TripWarnings warnings={warnings} />

      <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
        <DndContext sensors={sensors} collisionDetection={collision} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActive(null)}>
          <SortableContext items={days.map((day) => day.id)} strategy={verticalListSortingStrategy}>
            <ol className="space-y-4">
              {days.map((day, index) => (
                <DayCard
                  key={day.id}
                  day={day}
                  index={index}
                  total={days.length}
                  dateLabel={
                    startDate
                      ? formatDate(addDays(startDate, index), language, { weekday: "short", day: "numeric", month: "short" })
                      : null
                  }
                  cost={estimate.days[index]?.total ?? 0}
                  currency={currency}
                  dayWarnings={warnings.filter((w) => w.dayIndex === index)}
                  days={days}
                />
              ))}
            </ol>
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeItem && <ItemBody item={activeItem} language={language} currency={currency} className="border border-charcoal-800 bg-canvas shadow-xl" />}
            {activeDay && (
              <div className="border border-charcoal-800 bg-canvas p-4 shadow-xl">
                <p className="font-display text-lg text-charcoal-900">
                  {pick(destinationBySlug.get(activeDay.destinationSlug)?.name ?? { en: "", ar: "" }, language)}
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        <div className="self-start lg:sticky lg:top-28">
          <EgyptMap destinations={destinations} route={route} selectOnHover={false} />
          <p className="mt-2 text-center text-xs text-ink-muted">{t("builder.itinerary.mapCaption", { count: stopsFromDays(days).length })}</p>
        </div>
      </div>
    </div>
  );
}

function DayCard({
  day,
  index,
  total,
  dateLabel,
  cost,
  currency,
  dayWarnings,
  days,
}: {
  day: TripDay;
  index: number;
  total: number;
  dateLabel: string | null;
  cost: number;
  currency: string;
  dayWarnings: TripWarning[];
  days: TripDay[];
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const moveDay = useTripStore((state) => state.moveDay);
  const addExperience = useTripStore((state) => state.addExperience);
  const addNote = useTripStore((state) => state.addNote);
  const destination = destinationBySlug.get(day.destinationSlug);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: day.id,
    data: { type: "day", index } satisfies DragData,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${day.id}`,
    data: { type: "dayDrop", dayId: day.id } satisfies DragData,
  });
  const chosen = new Set(experienceSlugsInDays(days));
  const available = (experiencesByDestination[day.destinationSlug] ?? []).filter((e) => !chosen.has(e.slug));
  const load = dayLoadMinutes(day);
  const hasProblem = dayWarnings.some((w) => w.severity === "warning");

  const onAdd = (value: string) => {
    if (value === "free" || value === "transport") addNote(day.id, value, "");
    else if (value) addExperience(value, day.id);
  };

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "border bg-canvas",
        hasProblem ? "border-ember-600/60" : "border-line",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={t("builder.itinerary.dragDay", { day: index + 1 })}
          className="hidden cursor-grab touch-none rounded-sm p-1 text-charcoal-400 hover:text-charcoal-800 active:cursor-grabbing sm:block"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
          </svg>
        </button>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-charcoal-800 font-display text-ivory">
          {formatNumber(index + 1, language)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight text-charcoal-900">
            {destination ? pick(destination.name, language) : day.destinationSlug}
          </p>
          <p className="text-xs text-ink-muted">
            {dateLabel ?? t("builder.itinerary.dayLabel", { day: formatNumber(index + 1, language) })}
            {load > 0 && (
              <>
                {" · "}
                {t("builder.itinerary.planned", { duration: formatDuration(load, t) })}
              </>
            )}
          </p>
        </div>
        <p className="text-sm text-charcoal-800">{formatMoney(cost, currency, language)}</p>
        <div className="flex gap-1">
          <button type="button" onClick={() => moveDay(index, index - 1)} disabled={index === 0} aria-label={t("builder.itinerary.dayEarlier", { day: index + 1 })} className="rounded-sm border border-charcoal-800/25 p-1.5 text-charcoal-700 hover:bg-sand-100 disabled:opacity-30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m6 15 6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" onClick={() => moveDay(index, index + 1)} disabled={index === total - 1} aria-label={t("builder.itinerary.dayLater", { day: index + 1 })} className="rounded-sm border border-charcoal-800/25 p-1.5 text-charcoal-700 hover:bg-sand-100 disabled:opacity-30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      <div ref={setDropRef} className={cn("px-4 py-3 transition-colors", isOver && "bg-sand-100")}>
        <SortableContext items={day.items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {day.items.length === 0 ? (
            <p className="py-2 text-sm text-ink-muted">{t("builder.itinerary.freeDay")}</p>
          ) : (
            <ul className="space-y-2">
              {day.items.map((item, itemIndex) => (
                <ItemRow key={item.id} item={item} day={day} itemIndex={itemIndex} days={days} language={language} currency={currency} />
              ))}
            </ul>
          )}
        </SortableContext>
        <label className="mt-3 block">
          <span className="sr-only">{t("builder.itinerary.addLabel")}</span>
          <select
            value=""
            onChange={(event) => onAdd(event.target.value)}
            className="w-full border border-dashed border-charcoal-800/30 bg-transparent px-3 py-2 text-sm text-charcoal-700 focus:border-ember-500 focus:outline-none"
          >
            <option value="">{t("builder.itinerary.addPrompt")}</option>
            {available.length > 0 && (
              <optgroup label={t("builder.itinerary.addExperiences")}>
                {available.map((experience) => (
                  <option key={experience.slug} value={experience.slug}>
                    {pick(experience.name, language)} · {formatDuration(experience.durationMinutes, t)}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label={t("builder.itinerary.addOther")}>
              <option value="free">{t("builder.itinerary.freeTime")}</option>
              <option value="transport">{t("builder.itinerary.transfer")}</option>
            </optgroup>
          </select>
        </label>
      </div>
    </li>
  );
}

function ItemRow({
  item,
  day,
  itemIndex,
  days,
  language,
  currency,
}: {
  item: TripItem;
  day: TripDay;
  itemIndex: number;
  days: TripDay[];
  language: string;
  currency: string;
}) {
  const { t } = useTranslation();
  const moveItem = useTripStore((state) => state.moveItem);
  const removeItem = useTripStore((state) => state.removeItem);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: "item", dayId: day.id } satisfies DragData,
  });
  const dayIndex = days.findIndex((d) => d.id === day.id);

  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && "opacity-40")}>
      <ItemBody
        item={item}
        language={language}
        currency={currency}
        className="border border-line bg-canvas"
        handle={
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={t("builder.itinerary.dragItem")}
            className="hidden cursor-grab touch-none rounded-sm p-1 text-charcoal-400 hover:text-charcoal-800 active:cursor-grabbing sm:block"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
            </svg>
          </button>
        }
        controls={
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => moveItem(item.id, day.id, itemIndex - 1)} disabled={itemIndex === 0} aria-label={t("builder.itinerary.itemEarlier")} className="rounded-sm p-1 text-charcoal-600 hover:bg-sand-100 disabled:opacity-30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m6 15 6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" onClick={() => moveItem(item.id, day.id, itemIndex + 1)} disabled={itemIndex === day.items.length - 1} aria-label={t("builder.itinerary.itemLater")} className="rounded-sm p-1 text-charcoal-600 hover:bg-sand-100 disabled:opacity-30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <label className="ms-1">
            <span className="sr-only">{t("builder.itinerary.moveToDay")}</span>
            <select
              value={dayIndex}
              onChange={(event) => {
                const target = days[Number(event.target.value)];
                if (target) moveItem(item.id, target.id, target.items.length);
              }}
              className="max-w-28 border border-line bg-canvas px-1.5 py-1 text-xs text-charcoal-700 focus:border-ember-500 focus:outline-none"
            >
              {days.map((d, i) => (
                <option key={d.id} value={i}>
                  {t("builder.itinerary.dayOption", { day: formatNumber(i + 1, language), place: pick(destinationBySlug.get(d.destinationSlug)?.name ?? { en: "", ar: "" }, language) })}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => removeItem(item.id)} aria-label={t("builder.itinerary.removeItem")} className="rounded-sm p-1 text-charcoal-500 hover:bg-sand-100 hover:text-ember-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
        }
      />
    </li>
  );
}

/** The card itself, shared by the row in the list and the copy under the pointer. */
function ItemBody({
  item,
  language,
  currency,
  className,
  handle,
  controls,
}: {
  item: TripItem;
  language: string;
  currency: string;
  className?: string;
  handle?: React.ReactNode;
  controls?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const updateNote = useTripStore((state) => state.updateNote);
  const experience = item.experienceSlug ? experienceBySlug.get(item.experienceSlug) : undefined;
  return (
    <div className={cn("flex items-center gap-3 px-3 py-2", className)}>
      {handle}
      <div className="min-w-0 flex-1">
        {experience ? (
          <>
            <p className="truncate text-charcoal-900">{pick(experience.name, language)}</p>
            <p className="text-xs text-ink-muted">
              {formatDuration(experience.durationMinutes, t)}
              {" · "}
              {t("builder.experiences.perPerson", { amount: formatMoney(experience.priceFrom, currency, language) })}
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs uppercase tracking-wide text-ink-muted">
              {item.kind === "free" ? t("builder.itinerary.freeTime") : t("builder.itinerary.transfer")}
            </span>
            <input
              type="text"
              value={item.note ?? ""}
              placeholder={item.kind === "free" ? t("builder.itinerary.freePlaceholder") : t("builder.itinerary.transferPlaceholder")}
              onChange={(event) => updateNote(item.id, event.target.value)}
              aria-label={item.kind === "free" ? t("builder.itinerary.freeTime") : t("builder.itinerary.transfer")}
              className="w-full min-w-0 border-b border-transparent bg-transparent text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:border-ember-500 focus:outline-none"
            />
          </div>
        )}
      </div>
      {controls}
    </div>
  );
}
