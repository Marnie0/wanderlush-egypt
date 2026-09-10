import { Circle, Document, Font, G, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import { MAP_HEIGHT, MAP_WIDTH, egyptOutlinePath, lakeNasserPath, nileEastPath, nileMainPath, nileWestPath } from "@/lib/egypt-geo";
import type { PdfDay, PdfPair, TripPdfData } from "@/lib/trip-pdf";

/**
 * The trip on paper: an A4 document in the site's own type and colours,
 * with the route drawn on the same map the builder uses. Everything it
 * prints arrives as strings in `TripPdfData`; this file decides only where
 * things go. Arabic runs right to left at the paragraph level, with the
 * rows mirrored, so the same layout serves both languages.
 */

const colour = {
  ivory: "#fdfbf7",
  sand50: "#fbf7f0",
  sand100: "#f5eee2",
  sand200: "#ebdfcb",
  sand300: "#dcc9ac",
  sand600: "#9a7a54",
  ink: "#12100c",
  ink700: "#2a2720",
  ink600: "#3d3931",
  muted: "#736e66",
  ember: "#a94a1b",
  teal: "#1a433e",
  gold: "#c09b4b",
  gold50: "#faf5e9",
  gold800: "#4e3d1d",
  ember50: "#fdf3ec",
  ember800: "#6b2f15",
  nile: "#4c8fb4",
  nile300: "#7cb0cd",
};

let registered = false;

/** Called once before rendering, with wherever the font files live. */
export function registerPdfFonts(base: string) {
  if (registered) return;
  registered = true;
  Font.register({ family: "Fraunces", src: `${base}fraunces-400.woff` });
  Font.register({
    family: "Inter",
    fonts: [
      { src: `${base}inter-400.woff`, fontWeight: 400 },
      { src: `${base}inter-500.woff`, fontWeight: 500 },
      { src: `${base}inter-600.woff`, fontWeight: 600 },
    ],
  });
  Font.register({
    family: "Amiri",
    fonts: [
      { src: `${base}amiri-400.woff`, fontWeight: 400 },
      { src: `${base}amiri-700.woff`, fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Plex Arabic",
    fonts: [
      { src: `${base}plex-arabic-400.woff`, fontWeight: 400 },
      { src: `${base}plex-arabic-500.woff`, fontWeight: 500 },
      { src: `${base}plex-arabic-600.woff`, fontWeight: 600 },
    ],
  });
  // No hyphenation: it would break Arabic words, and English never needs it at these measures.
  Font.registerHyphenationCallback((word) => [word]);
}

function makeStyles(rtl: boolean) {
  const display = rtl ? "Amiri" : "Fraunces";
  const body = rtl ? "Plex Arabic" : "Inter";
  const direction = rtl ? ("rtl" as const) : ("ltr" as const);
  const align = rtl ? ("right" as const) : ("left" as const);
  const row = rtl ? ("row-reverse" as const) : ("row" as const);
  const lead = rtl ? 1.6 : 1.3;
  return StyleSheet.create({
    // No lineHeight on the page or on the fixed footer: the renderer drops a
    // fixed element whose text carries one, so the leading lives on the
    // running-text styles instead.
    page: { paddingTop: 64, paddingBottom: 60, paddingHorizontal: 48, fontFamily: body, fontSize: 9.5, color: colour.ink700, backgroundColor: "#ffffff" },
    text: { direction, textAlign: align, lineHeight: lead },
    row: { flexDirection: row },
    // Chrome on every page.
    header: { position: "absolute", top: 24, left: 48, right: 48, flexDirection: row, justifyContent: "space-between", alignItems: "flex-end", borderBottomWidth: 0.75, borderBottomColor: colour.sand200, paddingBottom: 8 },
    headerBrand: { fontFamily: display, fontSize: 13, color: colour.ink },
    headerMeta: { lineHeight: lead, fontSize: 8, color: colour.muted, direction, textAlign: rtl ? "left" : "right" },
    footer: { position: "absolute", bottom: 24, left: 48, right: 48, flexDirection: row, justifyContent: "space-between", borderTopWidth: 0.75, borderTopColor: colour.sand200, paddingTop: 8 },
    footerText: { fontSize: 7.5, color: colour.muted, direction, textAlign: align, maxWidth: 380 },
    footerPage: { fontSize: 7.5, color: colour.muted, direction, textAlign: rtl ? "left" : "right" },
    // The opening.
    eyebrow: { fontSize: 8, letterSpacing: rtl ? 0 : 1.6, textTransform: rtl ? "none" : "uppercase", color: colour.ember, fontWeight: 500, direction, textAlign: align },
    title: { fontFamily: display, fontSize: 30, lineHeight: rtl ? 1.4 : 1.1, color: colour.ink, marginTop: 6, direction, textAlign: align },
    subtitle: { lineHeight: lead, fontSize: 11, color: colour.ink600, marginTop: 6, direction, textAlign: align },
    rule: { height: 1, width: 72, backgroundColor: colour.gold, marginTop: 12, alignSelf: rtl ? "flex-end" : "flex-start" },
    titleRow: { flexDirection: row, justifyContent: "space-between", alignItems: "flex-start", gap: 24 },
    referenceBox: { marginTop: 4, backgroundColor: colour.sand50, borderWidth: 0.75, borderColor: colour.sand200, paddingVertical: 8, paddingHorizontal: 12, minWidth: 150 },
    referenceLabel: { lineHeight: lead, fontSize: 7.5, color: colour.muted, letterSpacing: rtl ? 0 : 1.2, textTransform: rtl ? "none" : "uppercase", direction, textAlign: align },
    referenceValue: { fontFamily: display, fontSize: 18, lineHeight: 1.3, color: colour.ink, marginTop: 4, textAlign: align },
    referenceSent: { lineHeight: lead, fontSize: 7.5, color: colour.muted, marginTop: 6, direction, textAlign: align },
    // Facts beside the map.
    opening: { flexDirection: row, marginTop: 20, gap: 24 },
    facts: { flex: 1 },
    factRow: { flexDirection: row, justifyContent: "space-between", gap: 12, borderBottomWidth: 0.5, borderBottomColor: colour.sand200, paddingVertical: 4 },
    factLabel: { lineHeight: lead, color: colour.muted, direction, textAlign: align },
    factValue: { lineHeight: lead, color: colour.ink, fontWeight: 500, direction, textAlign: rtl ? "left" : "right", maxWidth: 190 },
    mapBox: { width: 190 },
    caption: { lineHeight: lead, fontSize: 7.5, color: colour.muted, marginTop: 4, textAlign: "center" },
    stopRow: { flexDirection: row, alignItems: "center", gap: 6, marginTop: 3 },
    stopNumber: { width: 14, height: 14, borderRadius: 7, backgroundColor: colour.ember, color: colour.ivory, fontSize: 7.5, fontWeight: 600, textAlign: "center", lineHeight: 1, paddingTop: 3 },
    stopText: { lineHeight: lead, fontSize: 8.5, color: colour.ink, direction, textAlign: align },
    stopNights: { fontSize: 8, color: colour.muted },
    // Sections.
    section: { marginTop: 22 },
    sectionTitle: { fontFamily: display, fontSize: 16, color: colour.ink, marginBottom: 8, direction, textAlign: align, lineHeight: rtl ? 1.5 : 1.2 },
    sectionHint: { fontSize: 8.5, color: colour.muted, marginTop: -4, marginBottom: 8, direction, textAlign: align },
    // Day by day.
    day: { flexDirection: row, gap: 12, borderTopWidth: 0.5, borderTopColor: colour.sand200, paddingVertical: 9 },
    dayNumber: { width: 26, height: 26, borderRadius: 13, backgroundColor: colour.ink, color: colour.ivory, fontFamily: display, fontSize: 12, textAlign: "center", lineHeight: 1, paddingTop: rtl ? 5 : 7 },
    dayBody: { flex: 1 },
    dayHead: { flexDirection: row, justifyContent: "space-between", alignItems: "baseline", gap: 12 },
    dayPlace: { fontFamily: display, fontSize: 13, color: colour.ink, direction, textAlign: align, lineHeight: rtl ? 1.5 : 1.2 },
    dayMeta: { lineHeight: lead, fontSize: 8, color: colour.muted, direction, textAlign: align },
    dayCost: { lineHeight: lead, fontSize: 9.5, color: colour.ink, fontWeight: 500 },
    item: { flexDirection: row, gap: 6, marginTop: 4 },
    itemMark: { width: 8, height: 1, backgroundColor: colour.gold, marginTop: 6 },
    itemTitle: { lineHeight: rtl ? 1.5 : 1.2, color: colour.ink, direction, textAlign: align },
    itemMeta: { lineHeight: rtl ? 1.5 : 1.2, fontSize: 8, color: colour.muted, direction, textAlign: align, marginTop: 1 },
    freeDay: { lineHeight: lead, fontSize: 9, color: colour.muted, marginTop: 3, direction, textAlign: align },
    // The estimate.
    estimateBox: { backgroundColor: colour.sand50, borderWidth: 0.75, borderColor: colour.sand200, padding: 14 },
    bar: { flexDirection: row, height: 7, backgroundColor: colour.sand100, marginBottom: 6 },
    legend: { flexDirection: row, flexWrap: "wrap", gap: 10, marginBottom: 10 },
    legendItem: { flexDirection: row, alignItems: "center", gap: 4 },
    swatch: { width: 6, height: 6, borderRadius: 3 },
    legendText: { lineHeight: lead, fontSize: 7.5, color: colour.ink600, direction, textAlign: align },
    costRow: { flexDirection: row, justifyContent: "space-between", gap: 12, paddingVertical: 3 },
    costLabel: { lineHeight: lead, color: colour.ink700, direction, textAlign: align },
    costMeta: { lineHeight: lead, fontSize: 7.5, color: colour.muted, direction, textAlign: align },
    costValue: { lineHeight: lead, color: colour.ink, textAlign: rtl ? "left" : "right" },
    costEmphasis: { borderTopWidth: 0.5, borderTopColor: colour.sand300, marginTop: 2, paddingTop: 6 },
    totalRow: { flexDirection: row, justifyContent: "space-between", alignItems: "center", borderTopWidth: 0.75, borderTopColor: colour.sand600, marginTop: 6, paddingTop: 8, marginBottom: 8 },
    totalLabel: { lineHeight: lead, fontWeight: 600, color: colour.ink, direction, textAlign: align },
    totalValue: { fontFamily: display, fontSize: 22, lineHeight: 1.3, color: colour.ink },
    perPerson: { lineHeight: lead, fontSize: 8.5, color: colour.muted, direction, textAlign: rtl ? "left" : "right", marginTop: 3 },
    // Notes and small print.
    noteBox: { backgroundColor: colour.gold50, borderLeftWidth: rtl ? 0 : 2, borderRightWidth: rtl ? 2 : 0, borderColor: colour.gold, paddingVertical: 7, paddingHorizontal: 10, marginTop: 6 },
    noteText: { lineHeight: lead, fontSize: 8.5, color: colour.gold800, direction, textAlign: align },
    warnBox: { backgroundColor: colour.ember50, borderLeftWidth: rtl ? 0 : 2, borderRightWidth: rtl ? 2 : 0, borderColor: colour.ember, paddingVertical: 7, paddingHorizontal: 10, marginTop: 6 },
    warnText: { lineHeight: lead, fontSize: 8.5, color: colour.ember800, direction, textAlign: align },
    twoColumns: { flexDirection: row, gap: 24 },
    column: { flex: 1 },
    small: { lineHeight: lead, fontSize: 8, color: colour.ink600, direction, textAlign: align },
    smallTitle: { fontWeight: 600, color: colour.ink },
    ruleItem: { flexDirection: row, gap: 6, marginTop: 3 },
    ruleIndex: { lineHeight: lead, width: 12, fontSize: 8, color: colour.muted },
  });
}

type Styles = ReturnType<typeof makeStyles>;

function Pair({ pair, s }: { pair: PdfPair; s: Styles }) {
  return (
    <View style={s.factRow}>
      <Text style={s.factLabel}>{pair.label}</Text>
      <Text style={[s.factValue, pair.muted ? { color: colour.muted, fontWeight: 400 } : {}]}>{pair.value}</Text>
    </View>
  );
}

function RouteMap({ data, s }: { data: TripPdfData; s: Styles }) {
  const width = 190;
  const height = Math.round((MAP_HEIGHT / MAP_WIDTH) * width);
  return (
    <View style={s.mapBox}>
      <Svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} width={width} height={height}>
        <Path d={egyptOutlinePath} fill={colour.sand100} stroke={colour.sand600} strokeWidth={2} strokeLinejoin="round" />
        <Path d={lakeNasserPath} fill={colour.nile300} opacity={0.8} />
        {[nileMainPath, nileWestPath, nileEastPath].map((d) => (
          <Path key={d} d={d} fill="none" stroke={colour.nile} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
        ))}
        {data.route.length > 1 && (
          <Path
            d={data.route.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ")}
            fill="none"
            stroke={colour.ember}
            strokeWidth={3}
            strokeDasharray="7 7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {data.stops.map((stop) => (
          <G key={`${stop.number}-${stop.place}`}>
            <Circle cx={stop.x} cy={stop.y} r={13} fill={colour.ember} stroke={colour.ivory} strokeWidth={2.5} />
            <Text x={stop.x} y={stop.y + 5} textAnchor="middle" style={{ fontFamily: "Inter", fontSize: 13, fontWeight: 600, fill: colour.ivory }}>
              {stop.number}
            </Text>
          </G>
        ))}
      </Svg>
      <Text style={s.caption}>{data.routeCaption}</Text>
      <View style={{ marginTop: 6 }}>
        {data.stops.map((stop) => (
          <View key={`${stop.number}-${stop.place}-row`} style={s.stopRow}>
            <Text style={s.stopNumber}>{stop.number}</Text>
            <Text style={s.stopText}>
              {stop.place} <Text style={s.stopNights}>· {stop.nights}</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Day({ day, s, freeDay }: { day: PdfDay; s: Styles; freeDay: string }) {
  return (
    <View style={s.day} wrap={false}>
      <Text style={s.dayNumber}>{day.number}</Text>
      <View style={s.dayBody}>
        <View style={s.dayHead}>
          <View>
            <Text style={s.dayPlace}>{day.place}</Text>
            {(day.date || day.load) && <Text style={s.dayMeta}>{[day.date, day.load].filter(Boolean).join(" · ")}</Text>}
          </View>
          {day.cost && <Text style={s.dayCost}>{day.cost}</Text>}
        </View>
        {day.items.length === 0 ? (
          <Text style={s.freeDay}>{freeDay}</Text>
        ) : (
          day.items.map((item, index) => (
            <View key={index} style={s.item}>
              <View style={s.itemMark} />
              <View style={{ flex: 1 }}>
                <Text style={[s.itemTitle, item.kind === "note" ? { color: colour.ink600 } : {}]}>{item.title}</Text>
                {item.meta && <Text style={s.itemMeta}>{item.meta}</Text>}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

export function TripDocument({ data }: { data: TripPdfData }) {
  const s = makeStyles(data.rtl);
  const pageLabel = (page: number, total: number) => data.labels.page.replace("{{page}}", String(page)).replace("{{total}}", String(total));
  const documentTitle = `${data.brand} · ${data.eyebrow}${data.reference ? ` · ${data.reference.value}` : ""}`;
  return (
    <Document title={documentTitle} author={data.brand} language={data.language} creator={data.brand} producer={data.brand}>
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          <Text style={s.headerBrand}>{data.brand}</Text>
          <Text style={s.headerMeta}>{data.reference ? `${data.eyebrow} · ${data.reference.value}` : data.eyebrow}</Text>
        </View>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{data.labels.footer}</Text>
          <Text style={s.footerPage} render={({ pageNumber, totalPages }) => pageLabel(pageNumber, totalPages ?? pageNumber)} />
        </View>

        <View style={s.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.eyebrow}>{data.eyebrow}</Text>
            <Text style={s.title}>{data.title}</Text>
            <Text style={s.subtitle}>{data.subtitle}</Text>
            <View style={s.rule} />
            <Text style={[s.text, { fontSize: 8, color: colour.muted, marginTop: 8 }]}>{data.prepared}</Text>
          </View>
          {data.reference && (
            <View style={s.referenceBox}>
              <Text style={s.referenceLabel}>{data.reference.label}</Text>
              <Text style={s.referenceValue}>{data.reference.value}</Text>
              <Text style={s.referenceSent}>{data.reference.sent}</Text>
            </View>
          )}
        </View>

        <View style={s.opening}>
          <View style={s.facts}>
            {data.facts.map((pair) => (
              <Pair key={pair.label} pair={pair} s={s} />
            ))}
            {data.unconfirmed && (
              <View style={s.noteBox}>
                <Text style={s.noteText}>{data.unconfirmed}</Text>
              </View>
            )}
            {data.transfers.length > 0 && (
              <View style={{ marginTop: 14 }}>
                <Text style={[s.text, { fontSize: 8, color: colour.muted, marginBottom: 2 }]}>{data.labels.transfers}</Text>
                {data.transfers.map((line) => (
                  <Text key={line} style={[s.text, { fontSize: 8.5, color: colour.ink600, marginTop: 2 }]}>
                    {line}
                  </Text>
                ))}
              </View>
            )}
          </View>
          <RouteMap data={data} s={s} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle} minPresenceAhead={90}>
            {data.labels.days}
          </Text>
          {data.days.map((day) => (
            <Day key={day.number} day={day} s={s} freeDay={data.labels.freeDay} />
          ))}
          {data.days.some((day) => day.cost) && <Text style={[s.small, { color: colour.muted, marginTop: 6 }]}>{data.labels.tableNote}</Text>}
        </View>

        <View style={s.section} wrap={false}>
          <Text style={s.sectionTitle}>{data.labels.estimate}</Text>
          <View style={s.estimateBox}>
            {data.cost.shares.length > 0 && (
              <>
                <View style={s.bar}>
                  {data.cost.shares.map((share) => (
                    <View key={share.label} style={{ width: `${share.share * 100}%`, backgroundColor: share.color }} />
                  ))}
                </View>
                <View style={s.legend}>
                  {data.cost.shares.map((share) => (
                    <View key={share.label} style={s.legendItem}>
                      <View style={[s.swatch, { backgroundColor: share.color }]} />
                      <Text style={s.legendText}>
                        {share.label} {share.percent}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
            {data.cost.lines.map((line) => (
              <View key={line.label} style={[s.costRow, line.emphasis ? s.costEmphasis : {}]}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.costLabel, line.emphasis ? { fontWeight: 600, color: colour.ink } : {}]}>{line.label}</Text>
                  {line.meta && <Text style={s.costMeta}>{line.meta}</Text>}
                </View>
                <Text style={[s.costValue, line.muted ? { color: colour.muted } : {}, line.emphasis ? { fontWeight: 600 } : {}]}>{line.value}</Text>
              </View>
            ))}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>{data.cost.total.label}</Text>
              <Text style={s.totalValue}>{data.cost.total.value}</Text>
            </View>
            <Text style={s.perPerson}>
              {data.cost.perPerson.label}: {data.cost.perPerson.value}
            </Text>
            {data.cost.perAdultChild && <Text style={s.perPerson}>{data.cost.perAdultChild}</Text>}
            {data.cost.conversion && <Text style={[s.perPerson, { marginTop: 6 }]}>{data.cost.conversion}</Text>}
          </View>
        </View>

        {data.notes.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.sectionTitle}>{data.labels.notes}</Text>
            {data.notes.map((note) => (
              <View key={note.text} style={note.severity === "warning" ? s.warnBox : s.noteBox}>
                <Text style={note.severity === "warning" ? s.warnText : s.noteText}>{note.text}</Text>
              </View>
            ))}
          </View>
        )}

        {(data.traveller || data.preferences) && (
          <View style={[s.section, s.twoColumns]} wrap={false}>
            {data.traveller && (
              <View style={s.column}>
                <Text style={s.sectionTitle}>{data.labels.details}</Text>
                {data.traveller.map((pair) => (
                  <Pair key={pair.label} pair={pair} s={s} />
                ))}
              </View>
            )}
            {data.preferences && (
              <View style={s.column}>
                <Text style={s.sectionTitle}>{data.labels.preferences}</Text>
                {data.preferences.length === 0 ? (
                  <Text style={s.small}>{data.labels.nothingAdded}</Text>
                ) : (
                  data.preferences.map((pair) => <Pair key={pair.label} pair={pair} s={s} />)
                )}
              </View>
            )}
          </View>
        )}

        <View style={[s.section, s.twoColumns]} wrap={false}>
          <View style={s.column}>
            <Text style={s.sectionTitle}>{data.labels.rules}</Text>
            {data.rules.map((rule, index) => (
              <View key={rule.title} style={s.ruleItem}>
                <Text style={s.ruleIndex}>{index + 1}.</Text>
                {data.rtl ? (
                  <View style={{ flex: 1 }}>
                    <Text style={[s.small, s.smallTitle]}>{rule.title}</Text>
                    <Text style={s.small}>{rule.body}</Text>
                  </View>
                ) : (
                  <Text style={[s.small, { flex: 1 }]}>
                    <Text style={s.smallTitle}>{rule.title}</Text> {rule.body}
                  </Text>
                )}
              </View>
            ))}
          </View>
          <View style={[s.column, { maxWidth: 200 }]}>
            <Text style={s.sectionTitle}>{data.disclaimer.title}</Text>
            <View style={s.noteBox}>
              {data.disclaimer.items.map((item) => (
                <Text key={item} style={[s.noteText, { marginTop: 2 }]}>
                  {item}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
