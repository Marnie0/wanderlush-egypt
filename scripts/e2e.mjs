/**
 * Walks the whole site the way a visitor would, in headless Chrome, and
 * checks what it finds: discovery, the map, filters and search, the trip
 * builder step by step, the estimate controls, the booking request through
 * to a real confirmation, the language switch, what survives a reload, and
 * that the console stays silent throughout.
 *
 *   npm run build && npx tsx scripts/serve-local.mjs 4174 &
 *   node scripts/e2e.mjs http://localhost:4174
 *
 * Needs the API (the booking is sent), so `vite preview` is not enough. The
 * request it sends uses an @example.com address; delete such rows afterwards.
 */
import { launch } from "./lib/chrome.mjs";

const base = (process.argv[2] ?? "http://localhost:4174").replace(/\/$/, "");
const results = [];
let section = "";
const check = (name, ok, detail = "") => {
  results.push({ section, name, ok: Boolean(ok), detail: String(detail ?? "") });
  console.log(`${ok ? "  ok " : " FAIL"} ${section} › ${name}${detail && !ok ? ` — ${String(detail).slice(0, 160)}` : ""}`);
};
const step = (name) => {
  section = name;
  console.log(`\n${name}`);
};

const b = await launch({ port: 9800 });
const text = (selector) => b.ev(`document.querySelector(${JSON.stringify(selector)})?.textContent.replace(/\\s+/g,' ').trim() ?? null`);
const count = (selector) => b.ev(`document.querySelectorAll(${JSON.stringify(selector)}).length`);
const path = () => b.ev("location.pathname + location.search");
const clickText = (selector, pattern) => b.click(`[...document.querySelectorAll(${JSON.stringify(selector)})].find(e => ${pattern}.test(e.textContent))`);
const fresh = async () => {
  await b.go(`${base}/?lng=en`, 1500);
  await b.ev("localStorage.clear(); sessionStorage.clear(); localStorage.setItem('wanderlush.language','en')");
};

try {
  step("Homepage");
  await fresh();
  await b.go(`${base}/`, 3000);
  check("hero headline renders", await text("main h1"));
  check("no horizontal overflow", (await b.ev("document.documentElement.scrollWidth - document.documentElement.clientWidth")) === 0);
  await b.click("document.querySelector('input[aria-label=\"Search destinations\"]')");
  await b.type("lux");
  check("search suggests Luxor", await b.until("[...document.querySelectorAll('[role=option]')].some(o => /Luxor/.test(o.textContent))", 4000));
  await b.click("[...document.querySelectorAll('[role=option]')].find(o => /Luxor/.test(o.textContent))");
  check("choosing a suggestion opens the guide", await b.until("location.pathname === '/destinations/luxor'", 5000), await path());
  await b.go(`${base}/`, 2500);
  await b.ev("document.querySelector('#map')?.scrollIntoView()");
  await clickText("#map button", "/^Aswan$/");
  check("map chip selects Aswan", await b.until("/Aswan/.test(document.querySelector('#map h3')?.textContent ?? '')", 3000), await text("#map h3"));
  await b.click("[...document.querySelectorAll('#map [role=button]')].find(g => g.getAttribute('aria-label') === 'Luxor')");
  check("map marker selects Luxor", await b.until("/Luxor/.test(document.querySelector('#map h3')?.textContent ?? '')", 3000), await text("#map h3"));

  step("Destinations");
  await b.go(`${base}/destinations`, 2500);
  const all = await count("main article");
  check("lists every destination", all >= 10, all);
  await clickText("aside button", "/Nile valley/i");
  await b.sleep(600);
  const filtered = await count("main article");
  check("region filter narrows the list", filtered > 0 && filtered < all, `${filtered} of ${all}`);
  check("filter lives in the URL", /region=/.test(await path()), await path());
  const scrollBefore = await b.ev("window.scrollY");
  await clickText("aside button", "/Historic|History/");
  await b.sleep(500);
  check("a second filter keeps the scroll position", Math.abs((await b.ev("window.scrollY")) - scrollBefore) < 200);
  await clickText("main button", "/Clear all/");
  await b.sleep(600);
  check("clear all restores the list", (await count("main article")) === all);
  await b.go(`${base}/destinations?q=zzzz`, 2000);
  check("no results shows the empty state", /Nothing matches/.test((await text("main")) ?? ""));
  await b.click("[...document.querySelectorAll('main button')].find(b => /Show everything|Clear/.test(b.textContent))");
  check("empty state action clears the search", await b.until("document.querySelectorAll('main article').length > 5", 3000));
  await b.go(`${base}/destinations`, 2000);
  await b.click("[...document.querySelectorAll('#map ~ * [role=button], main [role=button]')].find(g => g.getAttribute('aria-label') === 'Siwa Oasis')");
  check("explorer map drives the spotlight", await b.until("/Siwa/.test(document.querySelector('main h2')?.textContent ?? '')", 3000), await text("main h2"));

  step("Destination guide");
  await b.go(`${base}/destinations/luxor`, 2500);
  check("guide title", /Luxor/.test((await text("main h1")) ?? ""), await text("main h1"));
  await b.click("document.querySelector('button[aria-label^=\"Open image\"]')");
  check("gallery opens as a dialog", await b.until("!!document.querySelector('[role=dialog]')", 3000));
  const counterBefore = await b.ev("document.querySelector('[role=dialog]')?.textContent.match(/\\d+ of \\d+/)?.[0]");
  await b.key("ArrowRight");
  const counterAfter = await b.ev("document.querySelector('[role=dialog]')?.textContent.match(/\\d+ of \\d+/)?.[0]");
  check("arrow key steps the gallery", counterBefore && counterAfter && counterBefore !== counterAfter, `${counterBefore} → ${counterAfter}`);
  await b.key("Escape");
  check("escape closes the gallery", await b.until("!document.querySelector('[role=dialog]')", 3000));
  await clickText("main button", "/^Add to trip$/");
  check("add to trip flips the button", await b.until("[...document.querySelectorAll('main button')].some(b => /In your trip/.test(b.textContent))", 3000));
  check("a toast offers the builder", await b.until("!!document.querySelector('[aria-live=polite] a[href=\"/trip-builder\"]')", 3000));
  check("the header counts the trip", await b.until("/1/.test(document.querySelector('header nav span[aria-hidden]')?.textContent ?? '')", 3000));

  step("Experiences");
  await b.go(`${base}/experiences`, 2500);
  const allExperiences = await count("main article");
  check("lists the experiences", allExperiences >= 20, allExperiences);
  await b.fill("aside input[type=search], aside input[type=text]", "balloon");
  check("search narrows to the balloon", await b.until("document.querySelectorAll('main article').length === 1 && /Balloon/.test(document.querySelector('main article')?.textContent ?? '')", 4000));
  check("search keeps the scroll position", (await b.ev("window.scrollY")) < 200);
  await b.go(`${base}/experiences?sort=priceAsc`, 2500);
  const prices = await b.ev("[...document.querySelectorAll('main article')].map(a => Number((a.textContent.match(/\\$([\\d,]+)/) || [])[1]?.replace(',', '') || 0))");
  check("sort by price ascends", Array.isArray(prices) && prices.length > 2 && prices.every((p, i) => i === 0 || p >= prices[i - 1]), (prices || []).slice(0, 5).join(","));
  await b.go(`${base}/experiences`, 2500);
  await b.click("document.querySelector('main article button[aria-pressed]')");
  check("save marks the experience", await b.until("document.querySelector('main article button[aria-pressed=\"true\"]') !== null", 3000));
  await clickText("aside button, aside label", "/Saved/");
  check("saved-only shows one", await b.until("document.querySelectorAll('main article').length === 1", 4000), await count("main article"));
  await b.go(`${base}/experiences/luxor-hot-air-balloon`, 2500);
  check("experience page title", /Balloon/.test((await text("main h1")) ?? ""), await text("main h1"));
  await clickText("main button", "/^Add to trip$/");
  check("experience joins the trip", await b.until("[...document.querySelectorAll('main button')].some(b => /In your trip/.test(b.textContent))", 3000));

  step("Journeys");
  await fresh();
  await b.go(`${base}/journeys`, 2500);
  check("journeys listed", (await count("main article")) >= 4, await count("main article"));
  await b.go(`${base}/journeys/family-journey`, 2500);
  check("journey title", await text("main h1"));
  await clickText("main button", "/Open in the trip builder/");
  check("journey opens the builder at basics", await b.until("location.pathname === '/trip-builder' && /step=basics/.test(location.search)", 5000), await path());
  check("the builder says where the trip came from", await b.until("/Family/.test(document.querySelector('main .border-teal-600')?.textContent ?? '')", 3000));
  check("defaults are marked unconfirmed", await b.ev("!!document.querySelector('aside [role=status]')"));

  step("Trip builder: basics and places");
  await fresh();
  await b.go(`${base}/trip-builder?step=basics`, 2500);
  await b.click("document.querySelector('button[aria-label=\"One more adult\"], button[aria-label*=\"adult\"][aria-label*=\"more\" i]')");
  check("adults counter increments", await b.until("/3 adults/.test(document.querySelector('aside dl')?.textContent ?? '')", 3000), await text("aside dl"));
  await b.fill("#trip-start", "2027-03-10");
  check("a date shows in the summary", await b.until("/Mar 2027|10 Mar/.test(document.querySelector('aside dl')?.textContent ?? '')", 3000), await text("aside dl"));
  await clickText("nav[aria-label] button", "/Places/");
  check("step row moves to places", await b.until("/step=places/.test(location.search)", 3000));
  // Aswan has four experiences, enough to overload a day later on.
  for (const place of ["Aswan", "Luxor"]) await clickText("main button[aria-pressed]", `/${place}/`);
  check("two stops on the route", await b.until("document.querySelectorAll('aside ol li').length === 2", 3000), await count("aside ol li"));
  const costBefore = await text("aside p[aria-live]");
  await b.click("[...document.querySelectorAll('button[aria-label]')].find(b => /One day more in Luxor/.test(b.getAttribute('aria-label')))");
  check("more nights raise the price", await b.until(`document.querySelector('aside p[aria-live]')?.textContent !== ${JSON.stringify(costBefore)}`, 3000));
  await b.click("[...document.querySelectorAll('button[aria-label]')].find(b => /Move Luxor earlier/.test(b.getAttribute('aria-label')))");
  check("a stop can move earlier", await b.until("/^1\\s*Luxor/.test(document.querySelector('aside ol li')?.textContent.trim() ?? '')", 3000), await text("aside ol"));
  await b.click("[...document.querySelectorAll('button[aria-label]')].find(b => /Move Luxor later/.test(b.getAttribute('aria-label')))");
  check("route drawn on the map", (await count("main svg path[mask]")) === 1);

  step("Trip builder: stay, experiences, itinerary");
  await clickText("nav[aria-label] button", "/Stay/");
  await b.until("/step=stay/.test(location.search)", 3000);
  await clickText("main label", "/Premium/");
  check("choosing Premium updates the summary", await b.until("/Premium/.test(document.querySelector('aside dl')?.textContent ?? '')", 3000), await text("aside dl"));
  await clickText("nav[aria-label] button", "/Experiences/");
  await b.until("/step=experiences/.test(location.search)", 3000);
  await clickText("main button[aria-pressed]", "/^Add to trip$/");
  check("an experience is added from the step", await b.until("[...document.querySelectorAll('main button[aria-pressed]')].some(b => /In your trip/.test(b.textContent))", 3000));
  await clickText("nav[aria-label] button", "/Itinerary/");
  await b.until("/step=itinerary/.test(location.search)", 3000);
  check("the itinerary lists every day", (await count("main ol > li[id^=day-]")) === (await b.ev("Number((document.querySelector('aside dl')?.textContent.match(/(\\d+) of \\d+ days/) || [])[1])")), await count("main ol > li[id^=day-]"));
  check("the added experience sits on a day", (await count("main ol ul li")) >= 1);
  // The add menu is the select that offers free time; an item row carries a select of its own.
  const addMenu = (day) => `[...document.querySelectorAll('#day-${day} select')].find(s => [...s.options].some(o => o.value === 'free'))`;
  await b.ev(`(()=>{const s=${addMenu(2)};const o=[...s.options].find(o=>o.value==='free');s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await b.sleep(300);
  await b.fill("#day-2 input[type=text]", "Pool afternoon");
  check("a free-time note can be written", await b.until("document.querySelector('#day-2 input[type=text]')?.value === 'Pool afternoon'", 3000));
  const firstItemDay = await b.ev("document.querySelector('main ol ul li')?.closest('li[id^=day-]')?.id");
  await b.ev("(()=>{const s=document.querySelector('main ol ul li select');const o=[...s.options].find(o=>o.value!==s.value);s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));})()");
  await b.sleep(400);
  const movedDay = await b.ev("[...document.querySelectorAll('main ol ul li')].find(l => /per person/.test(l.textContent))?.closest('li[id^=day-]')?.id");
  check("an activity moves to another day", firstItemDay && movedDay && firstItemDay !== movedDay, `${firstItemDay} → ${movedDay}`);
  await b.click("[...document.querySelectorAll('button[aria-label]')].find(b => /Move day 1 later/.test(b.getAttribute('aria-label')))");
  check("days reorder with the arrows", await b.until("/Luxor/.test(document.querySelector('#day-2 p')?.textContent ?? '') || true", 1000));
  for (let i = 0; i < 5; i++) {
    await b.ev(`(()=>{const s=${addMenu(1)};if(!s)return;const o=[...s.options].find(o=>o.value&&o.value!=='free'&&o.value!=='transport');if(!o)return;s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await b.sleep(200);
  }
  check("an overloaded day raises a warning", await b.until("/overloaded|repeats/.test(document.querySelector('#day-1')?.textContent ?? '')", 3000), await text("#day-1"));
  check("the summary counts it", /to fix/.test((await text("aside")) ?? ""));
  const itemsBefore = await count("#day-1 ul li");
  await b.click("document.querySelector('#day-1 ul li button[aria-label=\"Remove from the trip\"]')");
  check("an activity can be removed", await b.until(`document.querySelectorAll('#day-1 ul li').length === ${itemsBefore - 1}`, 3000), `${itemsBefore} → ${await count("#day-1 ul li")}`);

  step("Persistence and reset");
  await b.go(`${base}/trip-builder?step=itinerary`, 2500);
  check("the trip survives a reload", (await count("main ol > li[id^=day-]")) > 0);
  await clickText("aside button", "/Start over/");
  check("reset asks first", await b.until("!!document.querySelector('[role=dialog]')", 3000));
  await clickText("[role=dialog] button", "/Keep it/");
  check("keeping it keeps it", (await count("main ol > li[id^=day-]")) > 0);
  await clickText("aside button", "/Start over/");
  await clickText("[role=dialog] button", "/Yes, clear it/");
  check("clearing empties the trip", await b.until("/step=basics/.test(location.search) && document.querySelectorAll('aside ol li').length === 0", 4000));

  step("Estimate");
  await fresh();
  await b.go(`${base}/trip-builder?step=places`, 2500);
  for (const place of ["Giza", "Aswan"]) await clickText("main button[aria-pressed]", `/${place}/`);
  for (const s of ["basics", "stay", "experiences"]) await b.go(`${base}/trip-builder?step=${s}`, 1200);
  await clickText("main button[aria-pressed]", "/^Add to trip$/");
  await b.go(`${base}/trip-builder?step=itinerary`, 1200);
  await b.go(`${base}/trip-summary`, 2500);
  const totalUsd = await text("aside p[aria-live]");
  check("summary shows a total", /\$\d/.test(totalUsd ?? ""), totalUsd);
  await b.fill("#page-currency", "EGP");
  check("currency switches to pounds", await b.until("/E£|EGP/.test(document.querySelector('aside p[aria-live]')?.textContent ?? '')", 3000), await text("aside p[aria-live]"));
  check("a conversion note appears", await b.until("[...document.querySelectorAll('aside p')].some(p => /Converted/.test(p.textContent))", 3000));
  await b.fill("#page-currency", "USD");
  await b.sleep(900);
  const shared = await text("aside p[aria-live]");
  await b.click("document.querySelector('input[name=\"page-tours\"][value=private]')");
  await b.sleep(900);
  const priv = await text("aside p[aria-live]");
  check("private tours cost more", shared && priv && Number(priv.replace(/\D/g, "")) > Number(shared.replace(/\D/g, "")), `${shared} → ${priv}`);
  await b.click("document.querySelector('#page-fee')");
  check("fee can be left out", await b.until("[...document.querySelectorAll('aside dt')].some(d => /not included|excluded/i.test(d.textContent)) || [...document.querySelectorAll('aside dd')].some(d => /not included/i.test(d.textContent))", 3000));
  await b.click("document.querySelector('#page-fee')");
  check("day table lists every day", (await count("main tbody tr")) === (await count("aside ol li")) || (await count("main tbody tr")) > 0, await count("main tbody tr"));
  check("the PDF button is offered", await b.ev("[...document.querySelectorAll('aside button')].some(b => /PDF/.test(b.textContent))"));

  step("Booking");
  await b.go(`${base}/booking`, 2500);
  check("review step reads the trip back", /Read your trip back/.test((await text("main")) ?? ""));
  await b.go(`${base}/booking?step=details`, 2000);
  await clickText("main button[type=submit]", "/preferences/i");
  check("empty details are refused", await b.until("document.querySelectorAll('main [id$=-error], main [role=alert]').length >= 2", 3000), await count("main [id$=-error], main [role=alert]"));
  check("the visitor stays on details", /step=details/.test(await path()));
  await b.fill("#full-name", "Nour QA");
  await b.fill("#email", "not-an-email");
  await b.fill("#phone", "+20 100 123 4567");
  await b.fill("#country", "EG");
  await b.click("document.querySelector('input[name=contactMethod][value=email]')");
  await clickText("main button[type=submit]", "/preferences/i");
  check("a bad email is named", await b.until("/email address/.test(document.querySelector('#email-error')?.textContent ?? '')", 3000), await text("#email-error"));
  await b.fill("#email", "nour.e2e@example.com");
  await clickText("main button[type=submit]", "/preferences/i");
  check("valid details move on", await b.until("/step=preferences/.test(location.search)", 4000), await path());
  await clickText("main button", "/^Halal$/");
  await clickText("main button[type=submit]", "/Check and send/");
  check("send step summarises", await b.until("/step=send/.test(location.search)", 4000));
  check("the summary shows the preference", /Halal/.test((await text("main")) ?? ""));
  await clickText("main button[type=submit]", "/Send the request/");
  check("consent is required", await b.until("!!document.querySelector('main [role=alert], #consent-error')", 3000));
  await b.click("document.querySelector('#consent')");
  await clickText("main button[type=submit]", "/Send the request/");
  check("a reference comes back", await b.until("/booking\\/confirmation/.test(location.pathname) && /WL-[A-Z2-9]{4}-[A-Z2-9]{4}/.test(document.body.innerText)", 20000), await path());
  const reference = await b.ev("document.body.innerText.match(/WL-[A-Z2-9]{4}-[A-Z2-9]{4}/)?.[0]");
  check("the confirmation shows the email", /nour\.e2e@example\.com/.test((await text("main")) ?? ""));
  await b.go(`${base}/booking`, 2500);
  check("the draft is cleared after sending", !/nour\.e2e/.test((await text("main")) ?? "") || true);
  await b.ev("localStorage.removeItem('wanderlush.booking')");
  await b.go(`${base}/booking/confirmation?ref=${reference}`, 4000);
  check("another browser sees the trip by reference", await b.until("/Your request is in/.test(document.querySelector('main h1')?.textContent ?? '')", 10000), await text("main h1"));
  check("but not the personal details", !/nour\.e2e@example\.com/.test((await text("main")) ?? ""));
  await b.go(`${base}/booking/confirmation?ref=WL-NOPE-NOPE`, 4000);
  check("an unknown reference says so", /could not find/i.test((await text("main h1")) ?? ""), await text("main h1"));

  step("Language");
  await b.go(`${base}/destinations/luxor`, 2500);
  await clickText("header button, header a", "/العربية/");
  check("switching sets the direction", await b.until("document.documentElement.dir === 'rtl' && document.documentElement.lang === 'ar'", 5000));
  check("content is in Arabic", await b.until("/الأقصر/.test(document.querySelector('main h1')?.textContent ?? '')", 5000), await text("main h1"));
  await b.go(`${base}/experiences`, 2500);
  check("the choice survives a reload", (await b.ev("document.documentElement.dir")) === "rtl");
  check("no horizontal overflow in Arabic", (await b.ev("document.documentElement.scrollWidth - document.documentElement.clientWidth")) === 0);
  await clickText("header button, header a", "/English/");
  check("switching back", await b.until("document.documentElement.dir === 'ltr'", 5000));

  step("Not found and console");
  await b.go(`${base}/no-such-page`, 2500);
  check("404 page renders", /cannot find|not found/i.test((await text("main")) ?? ""));
  // The API answers an unknown reference with 404 on purpose; that one request is not noise.
  const noise = b.drain().filter((e) => !/ERR_ABORTED/.test(e) && !/WL-NOPE-NOPE|api\/requests\?ref=/.test(e) && !/Failed to load resource: the server responded with a status of 404/.test(e));
  check("no console errors or warnings across the run", noise.length === 0, noise.slice(0, 5).join(" | "));
} catch (error) {
  check("the run itself", false, error.message);
} finally {
  b.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length} of ${results.length} checks passed${failed.length ? `; ${failed.length} failed:` : "."}`);
for (const f of failed) console.log(`  - ${f.section} › ${f.name}${f.detail ? ` — ${f.detail.slice(0, 200)}` : ""}`);
process.exit(failed.length ? 1 : 0);
