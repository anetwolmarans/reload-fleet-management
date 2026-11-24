/* ============================================================
   UI part 2: forms, CSV export, events, init
   ============================================================ */

/* ---------- form definitions ---------- */
var FORMS = {
  vehicle: {
    title: "Add fleet unit",
    fields: [
      { k: "id", l: "Unit ID (e.g. RL-T-1013)", req: 1 },
      { k: "type", l: "Type", t: "select", opts: ["Truck (6x4 tractor)", "Truck (rigid)", "Trailer (superlink flatdeck)", "Trailer (superlink side tipper)", "Trailer (skeletal 40ft)"] },
      { k: "make", l: "Make & model", req: 1 },
      { k: "plate", l: "Registration plate", req: 1 },
      { k: "year", l: "Year", num: 1 },
      { k: "depot", l: "Depot", t: "select", opts: DEPOTS },
      { k: "status", l: "Status", t: "select", opts: VEH_STATUSES },
      { k: "odo", l: "Odometer (km)", num: 1 },
      { k: "cof", l: "COF valid until", t: "date", req: 1 },
      { k: "nextSvc", l: "Next service at (km)", num: 1 },
      { k: "assigned", l: "Assigned driver (optional)" }
    ],
    defaults: { status: "Available", depot: "Walvis Bay" }
  },
  driver: {
    title: "Add driver",
    fields: [
      { k: "name", l: "Full name", req: 1 },
      { k: "nat", l: "Nationality", req: 1 },
      { k: "depot", l: "Home depot", t: "select", opts: DEPOTS },
      { k: "licEx", l: "Licence expiry (Code EC)", t: "date", req: 1 },
      { k: "pdpEx", l: "PDP expiry", t: "date" },
      { k: "status", l: "Status", t: "select", opts: ["On trip", "Available", "Rest day", "Suspended"] },
      { k: "trips", l: "Trips YTD", num: 1 },
      { k: "score", l: "Telematics score (0–100)", num: 1 }
    ],
    defaults: { status: "Available", depot: "Walvis Bay", trips: 0, score: 75 }
  },
  fuel: {
    title: "Log fuel fill",
    fields: [
      { k: "date", l: "Date", t: "date", req: 1 },
      { k: "unit", l: "Unit", t: "select", src: "vehicles" },
      { k: "driver", l: "Driver" },
      { k: "litres", l: "Litres", num: 1, req: 1 },
      { k: "km", l: "Distance since last fill (km)", num: 1, req: 1 },
      { k: "country", l: "Country", t: "select", opts: ["Namibia", "Zambia", "DRC", "Botswana", "Zimbabwe"] },
      { k: "station", l: "Station / town" },
      { k: "price", l: "Price (US$ per litre)", num: 1, req: 1 }
    ],
    defaults: { date: APP.today, country: "Namibia" }
  },
  maint: {
    title: "Log maintenance job",
    fields: [
      { k: "unit", l: "Unit", t: "select", src: "vehicles", req: 1 },
      { k: "stype", l: "Service type", req: 1 },
      { k: "dueDate", l: "Due date", t: "date" },
      { k: "dueKm", l: "Due at odometer (km)", num: 1 },
      { k: "workshop", l: "Workshop / provider" },
      { k: "job", l: "Job description", ffull: 1 },
      { k: "est", l: "Estimated cost (US$)", num: 1 },
      { k: "status", l: "Status", t: "select", opts: ["Scheduled", "Due soon", "In progress", "Overdue", "Completed"] }
    ],
    defaults: { status: "Scheduled", workshop: "Reload Workshop – Walvis Bay (internal)" }
  },
  permit: {
    title: "Add cross-border permit",
    fields: [
      { k: "unit", l: "Unit", t: "select", src: "vehicles", req: 1 },
      { k: "country", l: "Country", t: "select", opts: ["Zambia", "DRC", "Botswana", "Zimbabwe", "Namibia", "Other"], req: 1 },
      { k: "ptype", l: "Permit type", t: "select", opts: ["SADC cross-border permit", "Route permit", "Temporary import permit", "Customs bond"] },
      { k: "ref", l: "Reference number", req: 1 },
      { k: "issued", l: "Issued", t: "date" },
      { k: "expiry", l: "Expiry", t: "date", req: 1 }
    ],
    defaults: { issued: APP.today, ptype: "SADC cross-border permit" }
  },
  inc: {
    title: "Report incident",
    fields: [
      { k: "date", l: "Date", t: "date", req: 1 },
      { k: "unit", l: "Unit", t: "select", src: "vehicles" },
      { k: "driver", l: "Driver" },
      { k: "itype", l: "Incident type", t: "select", opts: ["Collision", "Tyre failure", "Rollover", "Theft", "Hijacking", "Fire", "Load damage", "Other"] },
      { k: "loc", l: "Location (road / town / country)", ffull: 1, req: 1 },
      { k: "severity", l: "Severity", t: "select", opts: ["Minor", "Moderate", "Major"] },
      { k: "injuries", l: "Injuries", t: "select", opts: ["None", "Minor injuries", "Serious injuries"] },
      { k: "claim", l: "Claim status", t: "select", opts: ["Open", "Submitted", "Settled", "Closed"] },
      { k: "est", l: "Estimated cost (US$)", num: 1 },
      { k: "notes", l: "Notes / actions taken", ffull: 1 }
    ],
    defaults: { date: APP.today, severity: "Minor", injuries: "None", claim: "Open" }
  },
  training: {
    title: "Log training",
    fields: [
      { k: "date", l: "Date", t: "date", req: 1 },
      { k: "driver", l: "Driver", t: "select", src: "drivers", req: 1 },
      { k: "course", l: "Course", req: 1 },
      { k: "valid", l: "Valid until", t: "date" },
      { k: "status", l: "Status", t: "select", opts: ["Completed", "Scheduled"] }
    ],
    defaults: { date: APP.today, status: "Completed" }
  }
};

function openForm(type) {
  var f = FORMS[type];
  if (!f) return;
  var html = '<h3>' + esc(f.title) + '</h3><form data-type="' + type + '" id="modalForm"><div class="fgrid">';
  f.fields.forEach(function (fd) {
    var req = fd.req ? " required" : "";
    var cls = fd.ffull ? ' class="ffull"' : "";
    var inner;
    if (fd.t === "select") {
      var opts = fd.opts ? fd.opts.slice() : [];
      if (fd.src === "vehicles") opts = db.vehicles.map(function (v) { return v.id; });
      if (fd.src === "drivers") opts = db.drivers.map(function (x) { return x.name; });
      inner = '<select name="' + fd.k + '"' + req + ">" + opts.map(function (o) {
        return "<option>" + esc(o) + "</option>";
      }).join("") + "</select>";
    } else if (fd.t === "date") {
      inner = '<input type="date" name="' + fd.k + '"' + req + (f.defaults[fd.k] ? ' value="' + f.defaults[fd.k] + '"' : "") + ">";
    } else {
      inner = '<input type="text" name="' + fd.k + '"' + req + (fd.num ? ' inputmode="decimal"' : "") + ">";
    }
    html += "<label" + cls + ">" + esc(fd.l) + inner + "</label>";
  });
  html += '</div><div class="mact"><button class="btn ghost" type="button" data-close="1">Cancel</button>' +
    '<button class="btn" type="submit">Save record</button></div></form>';
  document.getElementById("modalBox").innerHTML = html;
  document.getElementById("modalBack").classList.add("open");
  var first = document.getElementById("modalForm").querySelector("input,select");
  if (first) first.focus();
}
function closeModal() {
  document.getElementById("modalBack").classList.remove("open");
}
function submitForm(e) {
  e.preventDefault();
  var form = e.target;
  var type = form.getAttribute("data-type");
  var o = {};
  FORMS[type].fields.forEach(function (fd) {
    var raw = form.elements[fd.k].value;
    o[fd.k] = fd.num ? (raw === "" ? 0 : Number(raw)) : raw;
  });
  o.id = uid(type === "vehicle" ? "RL-U" : type === "driver" ? "D" : type === "fuel" ? "FL" : type === "maint" ? "M" : type === "permit" ? "P" : type === "inc" ? "I" : "T");
  if (type === "vehicle") { if (!o.assigned) o.assigned = ""; db.vehicles.push(o); }
  else if (type === "driver") { o.hb = 0; o.spd = 0; o.idle = 0; o.ot = 90; db.drivers.push(o); }
  else if (type === "fuel") db.fuelLogs.push(o);
  else if (type === "maint") { o.cost = null; if (o.status === "Completed") { o.cost = o.est; } db.maintenance.push(o); }
  else if (type === "permit") db.permits.push(o);
  else if (type === "inc") db.incidents.push(o);
  else if (type === "training") db.trainings.push(o);
  saveDb();
  closeModal();
  renderAll();
  refreshCharts();
  toast("Record saved: " + o.id);
}

/* ---------- CSV export ---------- */
function exportCSV(name, headers, rows) {
  var escCell = function (s) {
    s = String(s == null ? "" : s);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  var csv = [headers.map(escCell).join(",")].concat(rows.map(function (r) { return r.map(escCell).join(","); })).join("\r\n");
  var blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 300);
  toast("Exported " + name);
}
function expFleet() {
  exportCSV("reload_fleet_register.csv",
    ["Unit", "Type", "Make & model", "Plate", "Year", "Depot", "Odometer km", "Status", "COF valid until", "Next service km", "Assigned driver"],
    fleetFiltered().map(function (v) { return [v.id, v.type, v.make, v.plate, v.year, v.depot, v.odo, v.status, v.cof, v.nextSvc || "", v.assigned || ""]; }));
}
function expMaint() {
  exportCSV("reload_maintenance.csv",
    ["Ref", "Unit", "Service type", "Job", "Due date", "Due km", "Workshop", "Status", "Est cost US$", "Actual cost US$"],
    mntFiltered().map(function (m) {
      var v = vehById(m.unit);
      return [m.id, m.unit, m.stype, m.job, m.dueDate || "", m.dueKm || "", m.workshop, mntStatus(m), m.est, (m.status === "Completed" && m.cost) || ""];
    }));
}
function expFuel() {
  exportCSV("reload_fuel_log.csv",
    ["Date", "Unit", "Driver", "Country", "Station", "Litres", "Distance km", "km per litre", "Price US$ per litre", "Cost US$"],
    fuelFiltered().map(function (f) {
      return [f.date, f.unit, f.driver, f.country, f.station, f.litres, f.km, (f.litres ? f.km / f.litres : 0).toFixed(2), f.price.toFixed(2), (f.litres * f.price).toFixed(2)];
    }));
}
function expPermits() {
  exportCSV("reload_permits.csv",
    ["Unit", "Country", "Permit type", "Reference", "Issued", "Expiry", "Days left"],
    permitsFiltered().map(function (p) { return [p.unit, p.country, p.ptype, p.ref, p.issued, p.expiry, daysUntil(p.expiry)]; }));
}
function expDrivers() {
  exportCSV("reload_drivers.csv",
    ["Driver", "Nationality", "Depot", "Licence expiry", "PDP expiry", "Trips YTD", "Harsh braking", "Speeding", "Idle hours", "On-time %", "Score", "Status"],
    driversFiltered().map(function (x) { return [x.name, x.nat, x.depot, x.licEx, x.pdpEx, x.trips, x.hb, x.spd, x.idle, x.ot, x.score, x.status]; }));
}
function expInc() {
  exportCSV("reload_incidents_claims.csv",
    ["Ref", "Date", "Unit", "Driver", "Type", "Location", "Severity", "Injuries", "Claim status", "Est cost US$", "Notes"],
    incidentsFiltered().map(function (i) { return [i.id, i.date, i.unit, i.driver, i.itype, i.loc, i.severity, i.injuries, i.claim, i.est, i.notes || ""]; }));
}

/* ---------- row actions ---------- */
function handleAction(act, id) {
  if (act === "renew") {
    var p = null;
    for (var i = 0; i < db.permits.length; i++) if (db.permits[i].id === id) p = db.permits[i];
    if (p) {
      p.issued = APP.today;
      p.expiry = addYears(daysUntil(p.expiry) < 0 ? APP.today : p.expiry, 1);
      saveDb(); renderAll(); refreshCharts();
      toast(p.unit + " – " + p.country + " permit renewed until " + fmtDate(p.expiry));
    }
  } else if (act === "complete") {
    var m = null;
    for (var j = 0; j < db.maintenance.length; j++) if (db.maintenance[j].id === id) m = db.maintenance[j];
    if (m) {
      m.status = "Completed";
      m.cost = m.est;
      saveDb(); renderAll(); refreshCharts();
      toast(m.id + " marked completed (" + money(m.est) + ")");
    }
  } else if (act === "closeClaim") {
    var inc = null;
    for (var k = 0; k < db.incidents.length; k++) if (db.incidents[k].id === id) inc = db.incidents[k];
    if (inc) {
      inc.claim = "Closed";
      saveDb(); renderAll(); refreshCharts();
      toast("Claim for " + inc.id + " closed");
    }
  }
}

/* ---------- toast ---------- */
var toastTimer = null;
function toast(msg) {
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200);
}

/* ---------- tabs ---------- */
var currentView = "dash";
function showTab(view) {
  currentView = view;
  var btns = document.querySelectorAll("#tabs button");
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.toggle("active", btns[i].getAttribute("data-view") === view);
  }
  var secs = document.querySelectorAll("section.view");
  for (var j = 0; j < secs.length; j++) {
    secs[j].classList.toggle("active", secs[j].id === "view-" + view);
  }
  refreshCharts();
}

/* ---------- init ---------- */
function fillToolbarOptions() {
  var st = document.getElementById("fltStatus");
  VEH_STATUSES.forEach(function (s) { var o = document.createElement("option"); o.value = s; o.textContent = s; st.appendChild(o); });
  var dp = document.getElementById("fltDepot");
  DEPOTS.forEach(function (s) { var o = document.createElement("option"); o.value = s; o.textContent = s; dp.appendChild(o); });
  var ms = document.getElementById("mntStatus");
  ["Overdue", "Due soon", "In progress", "Scheduled", "Completed"].forEach(function (s) {
    var o = document.createElement("option"); o.value = s; o.textContent = s; ms.appendChild(o);
  });
  var cc = document.getElementById("cptCountry");
  ["Zambia", "DRC", "Botswana", "Zimbabwe", "Namibia", "Other"].forEach(function (s) {
    var o = document.createElement("option"); o.value = s; o.textContent = s; cc.appendChild(o);
  });
  var sev = document.getElementById("incSeverity");
  ["Minor", "Moderate", "Major"].forEach(function (s) {
    var o = document.createElement("option"); o.value = s; o.textContent = s; sev.appendChild(o);
  });
}
function on(id, ev, fn) {
  var el = document.getElementById(id);
  if (el) el.addEventListener(ev, fn);
}
function debounce(fn, ms) {
  var t = null;
  return function () {
    if (t) clearTimeout(t);
    t = setTimeout(fn, ms);
  };
}
function init() {
  loadDb();
  var dt = d(APP.today).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  document.getElementById("headDate").innerHTML = "<b>" + esc(dt) + "</b> · Fleet Manager console";

  fillToolbarOptions();
  renderAll();
  showTab("dash");

  /* tabs */
  var tabs = document.getElementById("tabs");
  tabs.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (b) showTab(b.getAttribute("data-view"));
  });

  /* toolbar filters */
  on("fltSearch", "input", renderFleet);
  on("fltStatus", "change", renderFleet);
  on("fltDepot", "change", renderFleet);
  on("mntStatus", "change", renderMaint);
  on("fuelSearch", "input", renderFuel);
  on("cptCountry", "change", renderCompliance);
  on("drvSearch", "input", renderDrivers);
  on("incSeverity", "change", renderIncidents);

  /* add buttons */
  on("btnAddVehicle", "click", function () { openForm("vehicle"); });
  on("btnAddDriver", "click", function () { openForm("driver"); });
  on("btnAddFuel", "click", function () { openForm("fuel"); });
  on("btnAddMaint", "click", function () { openForm("maint"); });
  on("btnAddPermit", "click", function () { openForm("permit"); });
  on("btnAddInc", "click", function () { openForm("inc"); });
  on("btnAddTraining", "click", function () { openForm("training"); });

  /* exports */
  on("btnExpFleet", "click", expFleet);
  on("btnExpMaint", "click", expMaint);
  on("btnExpFuel", "click", expFuel);
  on("btnExpPermits", "click", expPermits);
  on("btnExpDrivers", "click", expDrivers);
  on("btnExpInc", "click", expInc);

  /* header */
  on("btnPrint", "click", function () { window.print(); });
  on("btnReset", "click", function () {
    if (window.confirm("Reset all data to the seeded demo fleet? Your added records will be lost.")) resetDb();
  });

  /* modal */
  on("modalBack", "click", function (e) {
    if (e.target === document.getElementById("modalBack")) closeModal();
  });
  on("modalBox", "click", function (e) {
    if (e.target.getAttribute && e.target.getAttribute("data-close")) closeModal();
  });
  on("modalBox", "submit", submitForm);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  /* row actions (delegated) */
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".act-btn");
    if (b) handleAction(b.getAttribute("data-act"), b.getAttribute("data-id"));
  });

  /* redraw charts on resize */
  window.addEventListener("resize", debounce(refreshCharts, 200));
}
document.addEventListener("DOMContentLoaded", init);
