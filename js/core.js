"use strict";
/* ============================================================
   Reload Logistics – Fleet Management System (static demo)
   Core: seed data, storage, date/format helpers, derived logic.
   ============================================================ */
var APP = { today: "2026-11-24" };
var LS_KEY = "reload_fms_v1";

var SEED = {
  fleetKmYtd: 1842000,
  fuelTrend: [
    { month: "Jun 2026", cost: 116200 },
    { month: "Jul 2026", cost: 121500 },
    { month: "Aug 2026", cost: 108900 },
    { month: "Sep 2026", cost: 124600 },
    { month: "Oct 2026", cost: 119800 },
    { month: "Nov 2026", cost: 118400 }
  ],
  vehicles: [
    { id: "RL-T-1001", type: "Truck (6x4 tractor)", make: "Volvo FH 440", plate: "N-2841 W", year: 2019, status: "On trip", depot: "Walvis Bay", odo: 512340, cof: "2027-03-18", nextSvc: 515000, assigned: "Simon Mwangala" },
    { id: "RL-T-1002", type: "Truck (6x4 tractor)", make: "Scania R 500", plate: "N-2877 W", year: 2020, status: "On trip", depot: "Ndola", odo: 398110, cof: "2027-01-22", nextSvc: 400000, assigned: "Emmanuel Kapinga" },
    { id: "RL-T-1003", type: "Truck (6x4 tractor)", make: "MAN TGS 33.480", plate: "N-3012 W", year: 2021, status: "Available", depot: "Walvis Bay", odo: 256480, cof: "2027-06-05", nextSvc: 260000, assigned: "" },
    { id: "RL-T-1004", type: "Truck (6x4 tractor)", make: "Mercedes-Benz Actros 2645", plate: "N-2755 W", year: 2018, status: "In workshop", depot: "Walvis Bay", odo: 602900, cof: "2026-12-14", nextSvc: 605000, assigned: "" },
    { id: "RL-T-1005", type: "Truck (6x4 tractor)", make: "Volvo FH 480", plate: "N-3140 W", year: 2022, status: "On trip", depot: "Lusaka", odo: 187220, cof: "2027-08-30", nextSvc: 190000, assigned: "Bright Chirwa" },
    { id: "RL-T-1006", type: "Truck (rigid)", make: "UD Quester CGE", plate: "N-2869 W", year: 2019, status: "Available", depot: "Gaborone", odo: 441150, cof: "2027-02-11", nextSvc: 445000, assigned: "" },
    { id: "RL-T-1007", type: "Truck (6x4 tractor)", make: "Scania G 460", plate: "N-2688 W", year: 2017, status: "On trip", depot: "Bulawayo", odo: 688300, cof: "2027-01-05", nextSvc: 690000, assigned: "Tendai Moyo" },
    { id: "RL-T-1008", type: "Truck (6x4 tractor)", make: "Isuzu FVZ 1400", plate: "N-2933 W", year: 2020, status: "On trip", depot: "Lubumbashi", odo: 355640, cof: "2027-04-02", nextSvc: 358000, assigned: "Given Sibanda" },
    { id: "RL-T-1009", type: "Truck (6x4 tractor)", make: "MAN TGS 41.480", plate: "N-3021 W", year: 2021, status: "Available", depot: "Ndola", odo: 233970, cof: "2027-05-19", nextSvc: 236000, assigned: "" },
    { id: "RL-T-1010", type: "Truck (6x4 tractor)", make: "Volvo FMX 540", plate: "N-3198 W", year: 2023, status: "On trip", depot: "Katima Mulilo", odo: 96450, cof: "2027-09-08", nextSvc: 99000, assigned: "Luka Hamutenya" },
    { id: "RL-T-1011", type: "Truck (6x4 tractor)", make: "Mercedes-Benz Actros 3348", plate: "N-2790 W", year: 2019, status: "Out of service", depot: "Walvis Bay", odo: 478830, cof: "2027-01-09", nextSvc: 480000, assigned: "" },
    { id: "RL-T-1012", type: "Truck (6x4 tractor)", make: "Scania R 450", plate: "N-2741 W", year: 2018, status: "On trip", depot: "Chirundu", odo: 521780, cof: "2027-07-25", nextSvc: 524000, assigned: "Petrus Shipanga" },
    { id: "RL-TR-2011", type: "Trailer (superlink flatdeck)", make: "SA Truck Bodies", plate: "N-8812 T", year: 2019, status: "On trip", depot: "Walvis Bay", odo: 310450, cof: "2027-05-02", nextSvc: null, assigned: "" },
    { id: "RL-TR-2018", type: "Trailer (superlink side tipper)", make: "PRBB", plate: "N-8850 T", year: 2021, status: "Available", depot: "Ndola", odo: 154900, cof: "2027-08-19", nextSvc: null, assigned: "" },
    { id: "RL-TR-2023", type: "Trailer (skeletal 40ft)", make: "Henred Fruehauf", plate: "N-8903 T", year: 2020, status: "In workshop", depot: "Bulawayo", odo: 268730, cof: "2026-12-22", nextSvc: null, assigned: "" }
  ],
  drivers: [
    { id: "D-01", name: "Simon Mwangala", nat: "Namibia", depot: "Walvis Bay", licEx: "2027-03-14", pdpEx: "2027-01-20", trips: 142, hb: 4, spd: 6, idle: 21, ot: 94, score: 91, status: "On trip" },
    { id: "D-02", name: "Bright Chirwa", nat: "Zambia", depot: "Lusaka", licEx: "2027-07-02", pdpEx: "2026-12-28", trips: 118, hb: 9, spd: 14, idle: 47, ot: 86, score: 74, status: "On trip" },
    { id: "D-03", name: "Tendai Moyo", nat: "Zimbabwe", depot: "Bulawayo", licEx: "2026-12-19", pdpEx: "2027-05-11", trips: 126, hb: 12, spd: 18, idle: 55, ot: 82, score: 69, status: "On trip" },
    { id: "D-04", name: "Petrus Shipanga", nat: "Namibia", depot: "Walvis Bay", licEx: "2027-11-08", pdpEx: "2027-04-22", trips: 151, hb: 3, spd: 4, idle: 18, ot: 96, score: 93, status: "On trip" },
    { id: "D-05", name: "Given Sibanda", nat: "Zimbabwe", depot: "Lubumbashi", licEx: "2027-06-30", pdpEx: "2026-12-05", trips: 133, hb: 7, spd: 9, idle: 39, ot: 90, score: 84, status: "On trip" },
    { id: "D-06", name: "Emmanuel Kapinga", nat: "Zambia", depot: "Ndola", licEx: "2027-09-14", pdpEx: "2027-08-02", trips: 109, hb: 15, spd: 22, idle: 61, ot: 79, score: 63, status: "Available" },
    { id: "D-07", name: "Luka Hamutenya", nat: "Namibia", depot: "Walvis Bay", licEx: "2027-04-17", pdpEx: "2027-02-26", trips: 98, hb: 5, spd: 5, idle: 24, ot: 93, score: 88, status: "On trip" },
    { id: "D-08", name: "Thabo Nkomo", nat: "Botswana", depot: "Gaborone", licEx: "2027-10-25", pdpEx: "2027-06-13", trips: 87, hb: 6, spd: 8, idle: 33, ot: 89, score: 81, status: "Rest day" },
    { id: "D-09", name: "Mateus Kambonde", nat: "Namibia", depot: "Walvis Bay", licEx: "2027-01-30", pdpEx: "2027-01-08", trips: 104, hb: 8, spd: 11, idle: 42, ot: 88, score: 77, status: "On trip" },
    { id: "D-10", name: "Chipo Nyirenda", nat: "Zambia", depot: "Ndola", licEx: "2026-11-30", pdpEx: "2027-03-19", trips: 95, hb: 10, spd: 12, idle: 44, ot: 85, score: 72, status: "Available" }
  ],
  fuelLogs: [
    { id: "FL-01", date: "2026-11-22", unit: "RL-T-1010", driver: "Luka Hamutenya", litres: 402, km: 905, country: "Zambia", station: "Sesheke", price: 1.22 },
    { id: "FL-02", date: "2026-11-21", unit: "RL-T-1001", driver: "Simon Mwangala", litres: 448, km: 988, country: "Namibia", station: "Otavi", price: 1.15 },
    { id: "FL-03", date: "2026-11-21", unit: "RL-T-1007", driver: "Tendai Moyo", litres: 465, km: 1002, country: "Botswana", station: "Francistown", price: 1.19 },
    { id: "FL-04", date: "2026-11-20", unit: "RL-T-1012", driver: "Petrus Shipanga", litres: 431, km: 906, country: "Zimbabwe", station: "Bulawayo", price: 1.24 },
    { id: "FL-05", date: "2026-11-19", unit: "RL-T-1005", driver: "Bright Chirwa", litres: 438, km: 1007, country: "Zambia", station: "Kafue", price: 1.18 },
    { id: "FL-06", date: "2026-11-18", unit: "RL-T-1008", driver: "Given Sibanda", litres: 472, km: 1044, country: "DRC", station: "Kasumbalesa", price: 1.35 },
    { id: "FL-07", date: "2026-11-17", unit: "RL-T-1002", driver: "Emmanuel Kapinga", litres: 447, km: 921, country: "Zambia", station: "Ndola", price: 1.18 },
    { id: "FL-08", date: "2026-11-16", unit: "RL-T-1006", driver: "Thabo Nkomo", litres: 419, km: 866, country: "Botswana", station: "Gaborone", price: 1.19 },
    { id: "FL-09", date: "2026-11-15", unit: "RL-T-1009", driver: "Chipo Nyirenda", litres: 405, km: 843, country: "Namibia", station: "Rundu", price: 1.15 },
    { id: "FL-10", date: "2026-11-14", unit: "RL-T-1010", driver: "Luka Hamutenya", litres: 398, km: 894, country: "Namibia", station: "Katima Mulilo", price: 1.15 },
    { id: "FL-11", date: "2026-11-12", unit: "RL-T-1001", driver: "Simon Mwangala", litres: 455, km: 1012, country: "Namibia", station: "Windhoek", price: 1.15 },
    { id: "FL-12", date: "2026-11-11", unit: "RL-T-1012", driver: "Petrus Shipanga", litres: 442, km: 938, country: "Zambia", station: "Livingstone", price: 1.22 },
    { id: "FL-13", date: "2026-11-09", unit: "RL-T-1005", driver: "Bright Chirwa", litres: 451, km: 987, country: "Zambia", station: "Lusaka", price: 1.18 },
    { id: "FL-14", date: "2026-11-08", unit: "RL-T-1008", driver: "Given Sibanda", litres: 468, km: 1010, country: "Zambia", station: "Chingola", price: 1.22 }
  ],
  maintenance: [
    { id: "M-01", unit: "RL-T-1004", stype: "C-service (60,000 km)", dueDate: "2026-11-18", dueKm: 605000, workshop: "Reload Workshop – Walvis Bay (internal)", job: "C-service + turbo oil seal replacement", est: 1850, status: "In progress" },
    { id: "M-02", unit: "RL-T-1011", stype: "Accident repair", dueDate: "2026-11-26", dueKm: null, workshop: "Panel Beat Centre Windhoek (external)", job: "Cab & body repair after rollover (I-01)", est: 68000, status: "In progress" },
    { id: "M-03", unit: "RL-T-1007", stype: "B-service (50,000 km)", dueDate: null, dueKm: 690000, workshop: "Bulawayo Depot Workshop (internal)", job: "B-service + brake inspection", est: 950, status: "Scheduled" },
    { id: "M-04", unit: "RL-TR-2023", stype: "Suspension & brake reline", dueDate: "2026-11-20", dueKm: null, workshop: "Bulawayo Depot Workshop (internal)", job: "Air suspension bags + brake reline", est: 1200, status: "In progress" },
    { id: "M-05", unit: "RL-T-1010", stype: "A-service (10,000 km)", dueDate: null, dueKm: 99000, workshop: "Katima Mulilo Depot Workshop (internal)", job: "A-service, filters & fluid check", est: 420, status: "Scheduled" },
    { id: "M-06", unit: "RL-T-1001", stype: "COF roadworthy test", dueDate: "2027-03-18", dueKm: null, workshop: "NaTIS Centre Walvis Bay", job: "COF test submission", est: 180, status: "Scheduled" },
    { id: "M-07", unit: "RL-T-1002", stype: "Tyres – drive axle", dueDate: null, dueKm: 400000, workshop: "Manmar Tyres Ndola (external)", job: "Replace 4 drive-axle tyres", est: 2900, status: "Scheduled" },
    { id: "M-08", unit: "RL-T-1005", stype: "A-service (10,000 km)", dueDate: null, dueKm: 190000, workshop: "Lusaka Depot Workshop (internal)", job: "A-service", est: 420, status: "Scheduled" },
    { id: "M-09", unit: "RL-T-1012", stype: "Brake adjustment & COF prep", dueDate: "2026-11-10", dueKm: null, workshop: "Chirundu Partner Workshop (external)", job: "Slack adjusters + COF prep check", est: 260, status: "Scheduled" },
    { id: "M-10", unit: "RL-T-1006", stype: "Transmission oil change", dueDate: "2026-12-12", dueKm: null, workshop: "Gaborone Depot Workshop (internal)", job: "Gearbox & diff oil", est: 510, status: "Scheduled" },
    { id: "M-11", unit: "RL-T-1009", stype: "C-service (60,000 km)", dueDate: null, dueKm: 236000, workshop: "Ndola Depot Workshop (internal)", job: "C-service", est: 1680, status: "Scheduled" },
    { id: "M-12", unit: "RL-T-1004", stype: "COF roadworthy test", dueDate: "2026-12-14", dueKm: null, workshop: "NaTIS Centre Walvis Bay", job: "COF test after repairs", est: 180, status: "Scheduled" },
    { id: "M-13", unit: "RL-T-1003", stype: "B-service (50,000 km)", dueDate: "2026-11-08", dueKm: null, workshop: "Reload Workshop – Walvis Bay (internal)", job: "B-service", est: 940, status: "Completed", cost: 940 }
  ],
  permits: [
    { id: "P-01", unit: "RL-T-1001", country: "Zambia", ptype: "SADC cross-border permit", ref: "ZM-CBP-4401", issued: "2026-02-15", expiry: "2027-02-14" },
    { id: "P-02", unit: "RL-T-1001", country: "DRC", ptype: "Temporary import permit", ref: "CD-TIP-1187", issued: "2025-12-18", expiry: "2026-12-18" },
    { id: "P-03", unit: "RL-T-1002", country: "Zambia", ptype: "SADC cross-border permit", ref: "ZM-CBP-4477", issued: "2026-04-11", expiry: "2027-04-10" },
    { id: "P-04", unit: "RL-T-1002", country: "DRC", ptype: "Temporary import permit", ref: "CD-TIP-1206", issued: "2026-01-27", expiry: "2027-01-26" },
    { id: "P-05", unit: "RL-T-1005", country: "Zambia", ptype: "SADC cross-border permit", ref: "ZM-CBP-4590", issued: "2026-06-03", expiry: "2027-06-02" },
    { id: "P-06", unit: "RL-T-1007", country: "Zimbabwe", ptype: "Route permit", ref: "ZW-RP-8842", issued: "2025-11-06", expiry: "2026-11-05" },
    { id: "P-07", unit: "RL-T-1007", country: "Botswana", ptype: "SADC cross-border permit", ref: "BW-CBP-3312", issued: "2026-03-31", expiry: "2027-03-30" },
    { id: "P-08", unit: "RL-T-1008", country: "Zambia", ptype: "SADC cross-border permit", ref: "ZM-CBP-4633", issued: "2026-05-22", expiry: "2027-05-21" },
    { id: "P-09", unit: "RL-T-1008", country: "DRC", ptype: "Temporary import permit", ref: "CD-TIP-1291", issued: "2026-07-15", expiry: "2027-07-14" },
    { id: "P-10", unit: "RL-T-1010", country: "Zambia", ptype: "SADC cross-border permit", ref: "ZM-CBP-4718", issued: "2025-12-03", expiry: "2026-12-02" },
    { id: "P-11", unit: "RL-T-1012", country: "Zimbabwe", ptype: "Route permit", ref: "ZW-RP-8877", issued: "2026-02-09", expiry: "2027-02-08" },
    { id: "P-12", unit: "RL-T-1012", country: "Zambia", ptype: "SADC cross-border permit", ref: "ZM-CBP-4610", issued: "2025-09-18", expiry: "2027-09-17" },
    { id: "P-13", unit: "RL-T-1006", country: "Botswana", ptype: "SADC cross-border permit", ref: "BW-CBP-3390", issued: "2026-08-12", expiry: "2027-08-11" },
    { id: "P-14", unit: "RL-T-1004", country: "Botswana", ptype: "SADC cross-border permit", ref: "BW-CBP-3401", issued: "2025-10-06", expiry: "2027-10-05" }
  ],
  incidents: [
    { id: "I-01", date: "2026-10-12", unit: "RL-T-1011", driver: "Mateus Kambonde", itype: "Rollover", loc: "B1, Otjiwarongo–Otavi (Namibia)", severity: "Major", injuries: "None", claim: "Open", est: 68000, notes: "Long-haul night segment; fatigue suspected. Return-to-work process started; unit under repair (M-02)." },
    { id: "I-02", date: "2026-09-03", unit: "RL-T-1007", driver: "Tendai Moyo", itype: "Tyre failure", loc: "A3 near Francistown (Botswana)", severity: "Minor", injuries: "None", claim: "Settled", est: 2150, notes: "Drive-axle tyre burst; consequence of deferred tyre replacement (see M-07)." },
    { id: "I-03", date: "2026-08-19", unit: "RL-T-1012", driver: "Petrus Shipanga", itype: "Collision", loc: "Livingstone, Zambia", severity: "Moderate", injuries: "None", claim: "Submitted", est: 9400, notes: "Rear-end in stop-go traffic near the Victoria Falls turn-off." },
    { id: "I-04", date: "2026-07-27", unit: "RL-T-1006", driver: "Thabo Nkomo", itype: "Theft", loc: "Gaborone depot, Botswana", severity: "Minor", injuries: "None", claim: "Closed", est: 1100, notes: "Two batteries stolen overnight; depot fencing upgrade ordered." }
  ],
  trainings: [
    { id: "T-01", date: "2026-11-14", driver: "Simon Mwangala", course: "Dangerous goods refresher", valid: "2028-11-14", status: "Completed" },
    { id: "T-02", date: "2026-11-05", driver: "Emmanuel Kapinga", course: "Defensive-driving coaching (telematics flag)", valid: "2027-02-05", status: "Completed" },
    { id: "T-03", date: "2026-10-22", driver: "Bright Chirwa", course: "Border procedures – Kasumbalesa OSBP", valid: "2027-10-22", status: "Completed" },
    { id: "T-04", date: "2026-10-08", driver: "Tendai Moyo", course: "Eco-driving & fuel efficiency", valid: "2027-10-08", status: "Completed" },
    { id: "T-05", date: "2026-09-18", driver: "Given Sibanda", course: "HazChem renewal", valid: "2027-09-18", status: "Completed" },
    { id: "T-06", date: "2026-09-02", driver: "Luka Hamutenya", course: "First aid & fire safety", valid: "2027-09-02", status: "Completed" },
    { id: "T-07", date: "2026-08-27", driver: "Thabo Nkomo", course: "Cross-border documentation (SADC)", valid: "2027-08-27", status: "Completed" },
    { id: "T-08", date: "2026-12-10", driver: "Mateus Kambonde", course: "Fatigue management (post-incident)", valid: "2029-12-10", status: "Scheduled" }
  ],
  budget: [
    { cat: "Fuel", short: "Fuel", budget: 1320000, actual: 1285400 },
    { cat: "Maintenance & repairs", short: "Maint.", budget: 430000, actual: 412300 },
    { cat: "Tyres", short: "Tyres", budget: 90000, actual: 96800 },
    { cat: "Permits, licences & COF", short: "Permits", budget: 75000, actual: 71500 },
    { cat: "Insurance", short: "Insurance", budget: 120000, actual: 118000 },
    { cat: "Incident & damage costs", short: "Incidents", budget: 40000, actual: 58200 },
    { cat: "Driver training & licensing", short: "Training", budget: 30000, actual: 24600 },
    { cat: "Telematics & tracking", short: "Telematics", budget: 36000, actual: 34900 }
  ],
  providers: [
    { name: "Reload Workshop – Walvis Bay", kind: "Internal", note: "6 bays · 2 inspection pits" },
    { name: "Katima Mulilo Depot Workshop", kind: "Internal", note: "A/B services · tyres" },
    { name: "Ndola Depot Workshop", kind: "Internal", note: "A/B/C services" },
    { name: "Lusaka Depot Workshop", kind: "Internal", note: "A/B services" },
    { name: "Bulawayo Depot Workshop", kind: "Internal", note: "Suspension · brakes" },
    { name: "Scania Centre Windhoek", kind: "External", note: "OEM engine & gearbox" },
    { name: "Volvo Truck & Bus Centre Windhoek", kind: "External", note: "OEM service contract" },
    { name: "Manmar Tyres Ndola", kind: "External", note: "Tyre supply & fitment" },
    { name: "Panel Beat Centre Windhoek", kind: "External", note: "Accident bodywork" }
  ]
};

/* ---------- state ---------- */
var db = null;
function loadDb() {
  try {
    var raw = localStorage.getItem(LS_KEY);
    if (raw) { db = JSON.parse(raw); }
  } catch (e) { db = null; }
  if (!db || !db.vehicles) {
    db = JSON.parse(JSON.stringify(SEED));
    saveDb();
  }
}
function saveDb() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch (e) { /* storage unavailable: keep in memory */ }
}
function resetDb() {
  try { localStorage.removeItem(LS_KEY); } catch (e) {}
  db = null;
  loadDb();
  renderAll();
  refreshCharts();
  toast("Demo data has been reset to the seeded sample fleet.");
}

/* ---------- helpers ---------- */
function d(s) { return new Date(s + "T00:00:00"); }
function todayStr() { return APP.today; }
function daysUntil(s) { return Math.round((d(s) - d(todayStr())) / 86400000); }
function addYears(s, n) { var dt = d(s); dt.setFullYear(dt.getFullYear() + n); return dt.toISOString().slice(0, 10); }
function loc(n) { return Number(n || 0).toLocaleString("en-US"); }
function money(n) { return "US$ " + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }); }
function money2(n) { return "US$ " + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function fmtDate(s) {
  if (!s) return "—";
  return d(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function uid(p) { return p + "-" + Math.random().toString(36).slice(2, 7).toUpperCase(); }
function badge(text, cls) { return '<span class="badge b-' + cls + '">' + esc(text) + "</span>"; }
function emptyRow(n) { return '<tr><td colspan="' + n + '" class="note">No records match the current filters.</td></tr>'; }

var STATUS_CLS = { "On trip": "blue", "Available": "green", "In workshop": "amber", "Out of service": "red", "Rest day": "grey", "Suspended": "red" };
function statusBadge(s) { return badge(s, STATUS_CLS[s] || "grey"); }

function expiryBadge(days) {
  if (days < 0) return badge("Expired " + (-days) + "d ago", "red");
  if (days <= 30) return badge(days + "d left", "red");
  if (days <= 60) return badge(days + "d left", "amber");
  return badge("Valid", "green");
}

function scoreBadge(sc) {
  var cls = sc >= 85 ? "green" : sc >= 75 ? "blue" : sc >= 65 ? "amber" : "red";
  return badge(String(sc), cls);
}
function flagBadge(sc) {
  if (sc < 70) return badge("Coach", "red");
  if (sc < 80) return badge("Monitor", "amber");
  return badge("OK", "green");
}
function claimBadge(c) {
  var cls = c === "Open" ? "red" : c === "Submitted" ? "amber" : c === "Settled" ? "blue" : "green";
  return badge(c, cls);
}
function sevBadge(s) {
  var cls = s === "Major" ? "red" : s === "Moderate" ? "amber" : "grey";
  return badge(s, cls);
}
function mntBadge(s) {
  var cls = s === "Overdue" ? "red" : s === "Due soon" ? "amber" : s === "In progress" ? "blue" : s === "Completed" ? "green" : "grey";
  return badge(s, cls);
}

/* ---------- derived logic ---------- */
var DEPOTS = ["Walvis Bay", "Katima Mulilo", "Lusaka", "Ndola", "Lubumbashi", "Chirundu", "Gaborone", "Bulawayo"];
var VEH_STATUSES = ["On trip", "Available", "In workshop", "Out of service"];

function vehById(id) {
  for (var i = 0; i < db.vehicles.length; i++) if (db.vehicles[i].id === id) return db.vehicles[i];
  return null;
}
function mntStatus(m) {
  if (m.status === "Completed" || m.status === "In progress") return m.status;
  var v = vehById(m.unit);
  if (m.dueDate && daysUntil(m.dueDate) < 0) return "Overdue";
  if (m.dueKm && v && m.dueKm - v.odo < 0) return "Overdue";
  if (m.dueDate && daysUntil(m.dueDate) <= 14) return "Due soon";
  if (m.dueKm && v && m.dueKm - v.odo <= 3000) return "Due soon";
  return "Scheduled";
}
function effAgg() {
  var map = {};
  db.fuelLogs.forEach(function (f) {
    var o = map[f.unit] || (map[f.unit] = { fills: 0, litres: 0, km: 0, cost: 0 });
    o.fills++; o.litres += f.litres; o.km += f.km; o.cost += f.litres * f.price;
  });
  return map;
}
function fleetAvgKmL() {
  var km = 0, l = 0;
  db.fuelLogs.forEach(function (f) { km += f.km; l += f.litres; });
  return l ? km / l : 0;
}
function budgetTotals() {
  var b = 0, a = 0;
  db.budget.forEach(function (r) { b += r.budget; a += r.actual; });
  return { b: b, a: a, variance: b - a, used: b ? a / b * 100 : 0 };
}
function buildAlerts() {
  var list = [];
  function sev(level, title, msg) { list.push({ level: level, title: title, msg: msg }); }

  db.vehicles.forEach(function (v) {
    var dl = daysUntil(v.cof);
    if (dl < 0) sev("red", "Roadworthiness (COF) expired", v.id + " – COF expired " + fmtDate(v.cof) + ". Keep the unit off the road until the test is renewed.");
    else if (dl <= 45) sev("amber", "COF due in " + dl + " days", v.id + " – expires " + fmtDate(v.cof) + ". Book the roadworthy test (NaTIS).");
  });
  db.permits.forEach(function (p) {
    var dl = daysUntil(p.expiry);
    if (dl < 0) sev("red", "Cross-border permit expired", p.unit + " – " + p.country + " " + p.ptype + " expired " + fmtDate(p.expiry) + " (" + p.ref + "). Do not dispatch on this corridor until renewed.");
    else if (dl <= 14) sev("red", "Permit expiring in " + dl + " days", p.unit + " – " + p.country + " " + p.ptype + " expires " + fmtDate(p.expiry) + " (" + p.ref + "). Renew now to avoid a border turnaround.");
    else if (dl <= 60) sev("amber", "Permit renewal due", p.unit + " – " + p.country + " " + p.ptype + " expires " + fmtDate(p.expiry) + " (" + p.ref + ").");
  });
  db.drivers.forEach(function (dr) {
    var l1 = daysUntil(dr.licEx), l2 = daysUntil(dr.pdpEx);
    if (l1 < 0) sev("red", "Driver licence expired", dr.name + " – Code EC licence expired " + fmtDate(dr.licEx) + ". Suspend driving duties until renewed.");
    else if (l1 <= 30) sev("red", "Driver licence expiring in " + l1 + " days", dr.name + " – licence expires " + fmtDate(dr.licEx) + ". Book renewal now.");
    else if (l1 <= 60) sev("amber", "Driver licence due", dr.name + " – licence expires " + fmtDate(dr.licEx) + ".");
    if (l2 < 0) sev("red", "PDP expired", dr.name + " – PDP expired " + fmtDate(dr.pdpEx) + ".");
    else if (l2 <= 30) sev("red", "PDP expiring in " + l2 + " days", dr.name + " – PDP expires " + fmtDate(dr.pdpEx) + ". Required for cross-border loads.");
    else if (l2 <= 60) sev("amber", "PDP renewal due", dr.name + " – PDP expires " + fmtDate(dr.pdpEx) + ".");
  });
  db.maintenance.forEach(function (m) {
    var st = mntStatus(m);
    if (st === "Overdue") sev("red", "Service overdue", m.unit + " – " + m.stype + " (" + m.id + ") is past its due date/odometer at " + m.workshop + ".");
    else if (st === "Due soon") {
      var v = vehById(m.unit);
      var left = (m.dueKm && v) ? (m.dueKm - v.odo) + " km left" : (m.dueDate ? fmtDate(m.dueDate) : "");
      sev("amber", "Service due soon", m.unit + " – " + m.stype + " (" + left + "). Book with " + m.workshop + ".");
    } else if (st === "In progress" && m.est >= 10000) {
      sev("info", "Major job in workshop", m.unit + " – " + m.job + " (est. " + money(m.est) + ") in progress at " + m.workshop + ".");
    }
  });
  db.incidents.forEach(function (i) {
    if (i.claim === "Open" || i.claim === "Submitted") {
      sev("info", "Insurance claim " + i.claim.toLowerCase(), i.id + " – " + i.itype + " on " + fmtDate(i.date) + " (est. " + money(i.est) + "). Follow up with the insurer until settled.");
    }
  });
  var rank = { red: 0, amber: 1, info: 2 };
  list.sort(function (a, b) { return rank[a.level] - rank[b.level]; });
  return list;
}
function buildKpis() {
  var vs = db.vehicles;
  var onTrip = vs.filter(function (v) { return v.status === "On trip"; }).length;
  var shop = vs.filter(function (v) { return v.status === "In workshop"; }).length;
  var oos = vs.filter(function (v) { return v.status === "Out of service"; }).length;
  var util = vs.length ? Math.round(onTrip / vs.length * 100) : 0;
  var fuelNov = db.fuelTrend[db.fuelTrend.length - 1].cost;
  var avgK = fleetAvgKmL();
  var bt = budgetTotals();
  var cpk = db.fleetKmYtd ? bt.a / db.fleetKmYtd : 0;
  var svcDue = db.maintenance.filter(function (m) {
    return ["Overdue", "Due soon", "In progress"].indexOf(mntStatus(m)) !== -1;
  }).length;
  var permitsSoon = db.permits.filter(function (p) { return daysUntil(p.expiry) <= 60; }).length;
  var openClaims = db.incidents.filter(function (i) { return i.claim === "Open" || i.claim === "Submitted"; }).length;
  var avgScore = db.drivers.length ? db.drivers.reduce(function (s, x) { return s + x.score; }, 0) / db.drivers.length : 0;
  return [
    { l: "Fleet units (sample)", v: String(vs.length), s: onTrip + " on trip · " + shop + " workshop · " + oos + " off-road" },
    { l: "Utilization", v: util + "%", s: "share of units on trip" },
    { l: "Fuel spend – Nov", v: money(fuelNov), s: "6-month trend on Budget tab" },
    { l: "Avg consumption", v: avgK.toFixed(2) + " km/L", s: "computed from fuel logs" },
    { l: "Cost per km (YTD)", v: "US$ " + cpk.toFixed(2), s: "all fleet costs ÷ km run" },
    { l: "Services due ≤30d", v: String(svcDue), s: "incl. jobs in progress" },
    { l: "Permits expiring ≤60d", v: String(permitsSoon), s: "incl. expired – see alerts" },
    { l: "Incidents YTD", v: String(db.incidents.length), s: "sample fleet" },
    { l: "Open claims", v: String(openClaims), s: "insurance follow-up" },
    { l: "Avg driver score", v: avgScore.toFixed(1), s: "telematics index /100" },
    { l: "Budget used (YTD)", v: bt.used.toFixed(1) + "%", s: money(bt.variance) + " under budget" }
  ];
}
