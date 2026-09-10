import { destinationBySlug } from "@content/destinations";
import { experienceBySlug } from "@content/experiences";
import { currencies } from "@content/currencies";
import type { RequestDay, RequestEstimate, RequestTrip, TravellerDetails, Preferences } from "../../shared/booking";
import { CHILD_MAX_AGE, CHILD_RATE, GUESTS_PER_ROOM, SERVICE_FEE_RATE, type TripEstimate } from "./estimate";
import { MARKER_NUDGE, projectToMap } from "./egypt-geo";
import { addDays, formatDate, formatDuration, formatMoney, formatNumber, formatPercent, pick } from "./format";
import { countryName, preferenceSummary } from "./booking-request";
import { findRoute, distanceKm, routeModes } from "./transport";
import { dayLoadMinutes, stopsFromDays, LONG_TRANSFER_HOURS, type TripDay, type TripStep, type TripWarning } from "./trip-plan";
import { warningText } from "./warning-text";

/**
 * Everything the PDF says, as plain strings, decided here rather than in the
 * document. The document renders in a React tree of its own, outside the
 * app's providers, so it cannot translate or format anything itself; and a
 * trip reaches it from two places with two shapes (the live builder, and
 * the snapshot a booking request was sent with). Both are folded into the
 * one model below.
 */

export interface PdfPair {
  label: string;
  value: string;
  muted?: boolean;
}

export interface PdfCostLine extends PdfPair {
  meta?: string;
  emphasis?: boolean;
}

export interface PdfDayItem {
  kind: "experience" | "note";
  title: string;
  meta?: string;
}

export interface PdfDay {
  number: string;
  place: string;
  date: string | null;
  load: string | null;
  items: PdfDayItem[];
  cost: string | null;
}

export interface PdfStop {
  number: string;
  place: string;
  nights: string;
  x: number;
  y: number;
}

export interface PdfShare {
  label: string;
  share: number;
  percent: string;
  color: string;
}

export interface PdfNote {
  severity: "warning" | "note";
  text: string;
}

export interface TripPdfData {
  language: "en" | "ar";
  rtl: boolean;
  brand: string;
  tagline: string;
  siteHost: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  prepared: string;
  reference: { label: string; value: string; sent: string } | null;
  facts: PdfPair[];
  stops: PdfStop[];
  route: { x: number; y: number }[];
  routeCaption: string;
  transfers: string[];
  days: PdfDay[];
  cost: {
    lines: PdfCostLine[];
    total: PdfPair;
    perPerson: PdfPair;
    perAdultChild: string | null;
    conversion: string | null;
    shares: PdfShare[];
  };
  notes: PdfNote[];
  unconfirmed: string | null;
  traveller: PdfPair[] | null;
  preferences: PdfPair[] | null;
  rules: { title: string; body: string }[];
  disclaimer: { title: string; items: string[] };
  labels: {
    route: string;
    transfers: string;
    days: string;
    estimate: string;
    notes: string;
    details: string;
    preferences: string;
    nothingAdded: string;
    freeDay: string;
    rules: string;
    page: string;
    footer: string;
    tableNote: string;
  };
}

type T = (key: string, options?: Record<string, unknown>) => string;

/** One day as either source describes it. */
type SourceItem = { kind: "experience"; experienceSlug: string } | { kind: "note"; note?: string; hint?: "free" | "transport" };

interface SourceDay {
  destinationSlug: string;
  items: SourceItem[];
  loadMinutes: number | null;
}

function fromLiveDays(days: TripDay[]): SourceDay[] {
  return days.map((day) => ({
    destinationSlug: day.destinationSlug,
    loadMinutes: dayLoadMinutes(day),
    items: day.items.flatMap((item): SourceItem[] => {
      if (item.kind === "experience") return item.experienceSlug ? [{ kind: "experience", experienceSlug: item.experienceSlug }] : [];
      return [{ kind: "note", note: item.note?.trim() || undefined, hint: item.kind }];
    }),
  }));
}

function fromRequestDays(days: RequestDay[]): SourceDay[] {
  return days.map((day) => ({
    destinationSlug: day.destinationSlug,
    loadMinutes: null,
    items: [
      ...day.experienceSlugs.map((slug): SourceItem => ({ kind: "experience", experienceSlug: slug })),
      ...day.notes.map((note): SourceItem => ({ kind: "note", note })),
    ],
  }));
}

export interface BuildTripPdfOptions {
  t: T;
  language: string;
  siteHost: string;
  /** The live builder, or the snapshot a request was sent with. */
  trip: Pick<RequestTrip, "startDate" | "month" | "durationDays" | "adults" | "children" | "tier" | "tourStyle" | "serviceIncluded" | "currency"> & {
    days: TripDay[] | RequestDay[];
  };
  estimate: TripEstimate | RequestEstimate;
  warnings?: TripWarning[];
  unconfirmed?: TripStep[];
  journeyName?: string | null;
  reference?: { value: string; createdAt: string } | null;
  traveller?: TravellerDetails | null;
  preferences?: Preferences | null;
}

function isLiveDays(days: TripDay[] | RequestDay[]): days is TripDay[] {
  return days.length === 0 || "items" in days[0];
}

function isFullEstimate(estimate: TripEstimate | RequestEstimate): estimate is TripEstimate {
  return "days" in estimate;
}

export function buildTripPdfData({
  t,
  language: rawLanguage,
  siteHost,
  trip,
  estimate,
  warnings = [],
  unconfirmed = [],
  journeyName = null,
  reference = null,
  traveller = null,
  preferences = null,
}: BuildTripPdfOptions): TripPdfData {
  const language: "en" | "ar" = rawLanguage.startsWith("ar") ? "ar" : "en";
  const rtl = language === "ar";
  const money = (usd: number) => formatMoney(usd, trip.currency, language);
  const number = (value: number) => formatNumber(value, language);
  const sep = t("common.listSeparator");
  const days = isLiveDays(trip.days) ? fromLiveDays(trip.days) : fromRequestDays(trip.days);
  const full = isFullEstimate(estimate) ? estimate : null;
  const placeName = (slug: string) => {
    const destination = destinationBySlug.get(slug);
    return destination ? pick(destination.name, language) : slug;
  };

  // The trip in one line, under the title.
  const travellers =
    t("builder.summary.adults", { count: trip.adults }) +
    (trip.children > 0 ? `${sep}${t("builder.summary.children", { count: trip.children })}` : "");
  const dateOptions: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  const when = trip.startDate
    ? t("booking.summary.dates", {
        start: formatDate(trip.startDate, language, dateOptions),
        end: formatDate(addDays(trip.startDate, Math.max(0, days.length - 1)), language, dateOptions),
      })
    : trip.month
      ? t(`months.${trip.month}`)
      : t("builder.summary.datesOpen");
  const subtitle = [t("common.days", { count: days.length }), travellers, t(`tiers.${trip.tier}`), t(`estimate.controls.${trip.tourStyle}`)].join(" · ");

  const facts: PdfPair[] = [
    { label: t("builder.summary.when"), value: when },
    { label: t("builder.summary.travellers"), value: travellers },
    {
      label: t("builder.summary.length"),
      value: t(days.length > trip.durationDays ? "builder.summary.plannedOver" : "builder.summary.planned", {
        planned: number(days.length),
        duration: number(trip.durationDays),
      }),
    },
    { label: t("builder.summary.stay"), value: t(`tiers.${trip.tier}`) },
    { label: t("estimate.controls.tours"), value: t(`estimate.controls.${trip.tourStyle}`) },
    { label: t("estimate.controls.currency"), value: trip.currency },
  ];

  // The route: stops with their nights, on the map and as a list.
  const stopList = stopsFromDays(days.map((day) => ({ id: day.destinationSlug, destinationSlug: day.destinationSlug, items: [] })));
  const position = (slug: string) => {
    const destination = destinationBySlug.get(slug);
    if (!destination) return null;
    const base = projectToMap(destination.coordinates.lat, destination.coordinates.lng);
    const nudge = MARKER_NUDGE[slug] ?? { x: 0, y: 0 };
    return { x: base.x + nudge.x, y: base.y + nudge.y };
  };
  const stops: PdfStop[] = stopList.flatMap((stop, index) => {
    const point = position(stop.destinationSlug);
    return point
      ? [{ number: number(index + 1), place: placeName(stop.destinationSlug), nights: t("common.days", { count: stop.nights }), ...point }]
      : [];
  });
  const route = stopList
    .filter((stop, index) => index === 0 || stop.destinationSlug !== stopList[index - 1].destinationSlug)
    .map((stop) => position(stop.destinationSlug))
    .filter((point): point is { x: number; y: number } => point !== null);

  // Reading right to left, "from here to there" points left.
  const arrow = rtl ? "←" : "→";
  const transfers: string[] = [];
  stopList.forEach((stop, index) => {
    if (index === 0) return;
    const previous = destinationBySlug.get(stopList[index - 1].destinationSlug);
    const current = destinationBySlug.get(stop.destinationSlug);
    if (!previous || !current) return;
    const leg = findRoute(previous.slug, current.slug);
    const from = pick(previous.name, language);
    const to = pick(current.name, language);
    if (!leg) {
      transfers.push(`${from} ${arrow} ${to}: ${t("builder.transport.none")}`);
      return;
    }
    const parts = [
      routeModes(leg).map((mode) => t(`builder.transport.${mode}`)).join(sep),
      t("builder.transport.about", { duration: formatDuration(Math.round(leg.hours * 60), t) }),
      t("builder.transport.km", { km: number(distanceKm(previous.coordinates, current.coordinates)) }),
    ];
    if (leg.via) parts.push(t("builder.transport.via", { place: placeName(leg.via) }));
    if (leg.hours >= LONG_TRANSFER_HOURS) parts.push(t("builder.transport.long"));
    transfers.push(`${from} ${arrow} ${to}: ${parts.join(" · ")}`);
  });

  // Day by day.
  const pdfDays: PdfDay[] = days.map((day, index) => ({
    number: number(index + 1),
    place: placeName(day.destinationSlug),
    date: trip.startDate ? formatDate(addDays(trip.startDate, index), language, { weekday: "long", day: "numeric", month: "long" }) : null,
    load: day.loadMinutes ? t("builder.itinerary.planned", { duration: formatDuration(day.loadMinutes, t) }) : null,
    cost: full ? money(full.days[index]?.total ?? 0) : null,
    items: day.items.flatMap((item): PdfDayItem[] => {
      if (item.kind === "experience") {
        const experience = item.experienceSlug ? experienceBySlug.get(item.experienceSlug) : undefined;
        if (!experience) return [];
        const perPerson = t("builder.experiences.perPerson", { amount: money(experience.priceFrom) });
        return [{ kind: "experience", title: pick(experience.name, language), meta: `${formatDuration(experience.durationMinutes, t)} · ${perPerson}` }];
      }
      const hint = item.hint === "transport" ? t("builder.itinerary.transfer") : t("builder.itinerary.freeTime");
      return [{ kind: "note", title: item.note ?? hint, meta: item.note ? hint : undefined }];
    }),
  }));

  // The estimate.
  const rate = formatPercent(SERVICE_FEE_RATE, language);
  const lines: PdfCostLine[] = [
    {
      label: t("estimate.accommodation"),
      value: money(estimate.accommodation),
      meta: full ? [t("common.nights", { count: full.nights }), t("estimate.rooms", { count: full.rooms }), t(`tiers.${trip.tier}`)].join(" · ") : undefined,
    },
    {
      label: t("estimate.experiences"),
      value: money(estimate.experiences),
      meta: full
        ? [
            t("estimate.experienceCount", { count: full.experienceCount }),
            t(`estimate.style.${full.tourStyle}`),
            ...(full.sharedOnlyCount > 0 ? [t("estimate.sharedOnly", { count: full.sharedOnlyCount })] : []),
            ...(full.children > 0 && full.experienceCount > 0 ? [t("estimate.childRate")] : []),
            ...(full.childFreeCount > 0 ? [t("estimate.childFree", { count: full.childFreeCount })] : []),
          ].join(" · ")
        : undefined,
    },
    {
      label: t("estimate.transport"),
      value: money(estimate.transport),
      meta: full ? (full.transferCount > 0 ? t("estimate.transferCount", { count: full.transferCount }) : t("estimate.noTransfers")) : undefined,
    },
    { label: t("estimate.subtotal"), value: money(estimate.subtotal), emphasis: true },
    {
      label: trip.serviceIncluded ? t("estimate.serviceFee") : t("estimate.serviceFeeExcluded"),
      value: trip.serviceIncluded ? money(estimate.serviceFee) : t("estimate.feeExcluded"),
      meta: trip.serviceIncluded ? t("estimate.feeRate", { rate }) : t("estimate.feeExcludedHint"),
      muted: !trip.serviceIncluded,
    },
  ];
  const option = currencies.find((c) => c.code === trip.currency);
  const parts: [string, number, string][] = [
    [t("estimate.accommodation"), estimate.accommodation, "#2c6e67"],
    [t("estimate.experiences"), estimate.experiences, "#c85f26"],
    [t("estimate.transport"), estimate.transport, "#a8853b"],
    [t("estimate.serviceFee"), trip.serviceIncluded ? estimate.serviceFee : 0, "#736e66"],
  ];
  const shares: PdfShare[] = estimate.total > 0 ? parts.filter(([, amount]) => amount > 0).map(([label, amount, color]) => ({ label, share: amount / estimate.total, percent: formatPercent(amount / estimate.total, language), color })) : [];

  // Warnings and notes, phrased the way the builder phrases them.
  const notes: PdfNote[] = warnings
    .filter((warning) => warning.kind !== "empty")
    .map((warning) => {
      const where = warning.dayIndex !== undefined ? `${t("builder.itinerary.dayLabel", { day: number(warning.dayIndex + 1) })}: ` : "";
      return { severity: warning.severity, text: `${where}${warningText(t, warning, language)}` };
    });
  const unconfirmedText =
    unconfirmed.length > 0
      ? `${t("builder.confirm.title")} ${t("builder.confirm.body", { travellers, stay: t(`tiers.${trip.tier}`) })}`
      : null;

  const ruleParams = {
    rate,
    childRate: formatPercent(CHILD_RATE, language),
    childAge: number(CHILD_MAX_AGE + 1),
    perRoom: number(GUESTS_PER_ROOM),
  };
  const rules = (["accommodation", "experiences", "children", "private", "transport", "fee", "perTraveller", "currency"] as const).map((key) => ({
    title: t(`estimate.rules.${key}Title`),
    body: t(`estimate.rules.${key}`, ruleParams),
  }));

  const now = new Date();
  return {
    language,
    rtl,
    brand: t("brand.name"),
    tagline: t("brand.tagline"),
    siteHost,
    eyebrow: t("pdf.eyebrow"),
    title: journeyName ?? t("pdf.untitled"),
    subtitle,
    prepared: t("pdf.prepared", { date: formatDate(now, language, { day: "numeric", month: "long", year: "numeric" }) }),
    reference: reference
      ? {
          label: t("booking.confirmation.reference"),
          value: reference.value,
          sent: t("booking.confirmation.sent", {
            date: formatDate(new Date(reference.createdAt), language, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          }),
        }
      : null,
    facts,
    stops,
    route,
    routeCaption: t("builder.itinerary.mapCaption", { count: stopList.length }),
    transfers,
    days: pdfDays,
    cost: {
      lines,
      total: { label: t("estimate.total"), value: money(estimate.total) },
      perPerson: { label: t("booking.summary.perTraveller"), value: money(estimate.perPerson) },
      perAdultChild: full && full.children > 0 ? t("estimate.perAdultChild", { adult: money(full.perAdult), child: money(full.perChild) }) : null,
      conversion:
        option && option.code !== "USD"
          ? t("estimate.converted", { rate: `1 USD = ${number(option.perUsd)} ${option.code}` })
          : null,
      shares,
    },
    notes,
    unconfirmed: unconfirmedText,
    traveller: traveller
      ? [
          { label: t("booking.details.fullName"), value: traveller.fullName },
          { label: t("booking.details.email"), value: traveller.email },
          { label: t("booking.details.phone"), value: traveller.phone },
          { label: t("booking.details.country"), value: countryName(traveller.country, language) },
          { label: t("booking.details.contactMethod"), value: t(`booking.details.contact.${traveller.contactMethod}`) },
        ]
      : null,
    preferences: preferences ? preferenceSummary(preferences, t) : null,
    rules,
    disclaimer: {
      title: t("estimate.disclaimer.title"),
      items: (["estimate", "availability", "flights", "specialist"] as const).map((key) => t(`estimate.disclaimer.${key}`)),
    },
    labels: {
      route: t("pdf.route"),
      transfers: t("pdf.transfers"),
      days: t("estimate.page.daysTitle"),
      estimate: t("pdf.estimate"),
      notes: t("pdf.notes"),
      details: t("booking.send.yourDetails"),
      preferences: t("booking.send.yourPreferences"),
      nothingAdded: t("booking.send.nothingAdded"),
      freeDay: t("estimate.page.freeDay"),
      rules: t("estimate.rules.title"),
      page: t("pdf.page"),
      footer: t("pdf.footer", { host: siteHost }),
      tableNote: t("estimate.page.tableNote"),
    },
  };
}

/** A file name that says what it is, with the reference when there is one. */
export function tripPdfFileName(reference?: string | null): string {
  return reference ? `wanderlush-egypt-${reference}.pdf` : "wanderlush-egypt-trip.pdf";
}
