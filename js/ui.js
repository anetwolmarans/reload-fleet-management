/* ============================================================
   UI part 1: view rendering (tables, alerts, KPIs, chips)
   ============================================================ */

/* ---------- KPI card builder + count-up animation ---------- */
function kpiCard(k, idx) {
  var cyc = ["", "c-azure", "c-green", "c-violet"];
  return '<div class="kpi"><i class="' + cyc[idx % 4] + '"></i><div class="l">' + esc(k.l) +
    '</div><div class="v">' + esc(k.v) + '</div><div class="s">' + esc(k.s) + "</div></div>";
}
function animateKpis(container) {
  if (!container) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var vals = container.querySelectorAll(".kpi .v");
  for (var i = 0; i < vals.length; i++) {
    (function (el, idx) {
      var orig = el.textContent;
      var m = orig.match(/-?\d[\d,]*(\.\d+)?/);
      if (!m) return;
      var num = parseFloat(m[0].replace(/,/g, ""));
      if (!isFinite(num)) return;
      var decimals = (m[0].split(".")[1] || "").length;
      var pre = orig.slice(0, m.index), suf = orig.slice(m.index + m[0].length);
      var t0 = null, dur = 820 + Math.min(idx * 45, 400);
      function frame(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        var v = num * e;
        var txt = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-US");
        el.textContent = pre + txt + suf;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    })(vals[i], i);
  }
}

/* ---------- dashboard ---------- */
function renderDash() {
  var alerts = buildAlerts();
  var el = document.getElementById("alertList");
  el.innerHTML = alerts.length
    ? alerts.map(function (a) {
        return '<div class="alert-item ' + a.level + '"><div><div class="t">' + esc(a.title) +
          '</div><div class="m">' + esc(a.msg) + "</div></div></div>";
      }).join("")
    : '<p class="note">No alerts. All compliance, maintenance and licence items are within thresholds.</p>';
  document.getElementById("alertCount").textContent = alerts.length + " open";
  document.getElementById("kpiGrid").innerHTML = buildKpis().map(kpiCard).join("");
  animateKpis(document.getElementById("kpiGrid"));
}

/* ---------- fleet register ---------- */
function fleetFiltered() {
  var q = (document.getElementById("fltSearch").value || "").toLowerCase().trim();
  var st = document.getElementById("fltStatus").value;
  var dp = document.getElementById("fltDepot").value;
  return db.vehicles.filter(function (v) {
    if (st !== "all" && v.status !== st) return false;
    if (dp !== "all" && v.depot !== dp) return false;
    if (q && (v.id + " " + v.make + " " + v.plate + " " + (v.assigned || "")).toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
}
function renderFleet() {
  var rows = fleetFiltered();
  document.getElementById("fleetTbody").innerHTML = rows.map(function (v) {
    var dl = daysUntil(v.cof);
    var kmLeft = v.nextSvc ? v.nextSvc - v.odo : null;
    var svcCell = kmLeft == null ? "—"
      : loc(v.nextSvc) + '<br><span class="note">' + loc(kmLeft) + " km left" + (kmLeft <= 3000 ? " · due" : "") + "</span>";
    return "<tr>" +
      '<td><b>' + esc(v.id) + "</b></td>" +
      "<td>" + esc(v.type) + "</td>" +
      "<td>" + esc(v.make) + '<br><span class="note">' + v.year + "</span></td>" +
      "<td>" + esc(v.plate) + "</td>" +
      "<td>" + esc(v.depot) + "</td>" +
      "<td>" + loc(v.odo) + "</td>" +
      "<td>" + statusBadge(v.status) + "</td>" +
      "<td>" + fmtDate(v.cof) + " " + expiryBadge(dl) + "</td>" +
      "<td>" + svcCell + "</td>" +
      "<td>" + esc(v.assigned || "—") + "</td>" +
      "</tr>";
  }).join("") || emptyRow(10);
  document.getElementById("fleetCount").textContent = "Showing " + rows.length + " of " + db.vehicles.length + " units";
}

/* ---------- maintenance ---------- */
function mntFiltered() {
  var st = document.getElementById("mntStatus").value;
  var arr = db.maintenance.slice().sort(function (a, b) { return a.id < b.id ? -1 : 1; });
  if (st === "all") return arr;
  return arr.filter(function (m) { return mntStatus(m) === st; });
}
function renderMaint() {
  var rows = mntFiltered();
  document.getElementById("mntTbody").innerHTML = rows.map(function (m) {
    var v = vehById(m.unit);
    var parts = [];
    if (m.dueDate) {
      var dl = daysUntil(m.dueDate);
      parts.push(fmtDate(m.dueDate) + (dl >= 0 ? " (" + dl + "d)" : " (overdue " + (-dl) + "d)"));
    }
    if (m.dueKm) {
      var left = v ? m.dueKm - v.odo : null;
      parts.push("odo " + loc(m.dueKm) + (left != null ? " (" + loc(left) + " km left)" : ""));
    }
    var st = mntStatus(m);
    var act = st === "Completed"
      ? '<span class="note">done</span>'
      : '<button class="btn small ghost act-btn" data-act="complete" data-id="' + esc(m.id) + '" type="button">Mark done</button>';
    return "<tr>" +
      '<td><b>' + esc(m.id) + "</b></td>" +
      '<td><b>' + esc(m.unit) + "</b></td>" +
      "<td>" + esc(m.stype) + '<br><span class="note">' + esc(m.job) + "</span></td>" +
      "<td>" + parts.join("<br>") + "</td>" +
      "<td>" + esc(m.workshop) + "</td>" +
      "<td>" + mntBadge(st) + "</td>" +
      "<td>" + money(m.status === "Completed" && m.cost ? m.cost : m.est) + "</td>" +
      "<td>" + act + "</td>" +
      "</tr>";
  }).join("") || emptyRow(8);
  document.getElementById("mntCount").textContent = "Showing " + rows.length + " of " + db.maintenance.length + " jobs";
  document.getElementById("provList").innerHTML = db.providers.map(function (p) {
    return '<span class="chip"><b>' + esc(p.name) + "</b> · " + esc(p.kind) + " · " + esc(p.note) + "</span>";
  }).join("");
}

/* ---------- fuel & telematics ---------- */
function fuelFiltered() {
  var q = (document.getElementById("fuelSearch").value || "").toLowerCase().trim();
  var arr = db.fuelLogs.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  if (!q) return arr;
  return arr.filter(function (f) {
    return (f.unit + " " + f.driver + " " + f.country + " " + f.station).toLowerCase().indexOf(q) !== -1;
  });
}
function renderFuel() {
  var rows = fuelFiltered();
  var avg = fleetAvgKmL();
  var totL = 0, totK = 0, totC = 0;
  document.getElementById("fuelTbody").innerHTML = rows.map(function (f) {
    var cost = f.litres * f.price;
    var kmL = f.litres ? f.km / f.litres : 0;
    var delta = kmL - avg;
    var kBadge = delta <= -0.12 ? badge("Low", "red") : delta >= 0.12 ? badge("Good", "green") : "";
    totL += f.litres; totK += f.km; totC += cost;
    return "<tr>" +
      "<td>" + fmtDate(f.date) + "</td>" +
      '<td><b>' + esc(f.unit) + "</b></td>" +
      "<td>" + esc(f.driver) + "</td>" +
      "<td>" + esc(f.country) + '<br><span class="note">' + esc(f.station) + "</span></td>" +
      "<td>" + loc(f.litres) + "</td>" +
      "<td>" + loc(f.km) + "</td>" +
      "<td>" + kmL.toFixed(2) + " " + kBadge + "</td>" +
      "<td>" + f.price.toFixed(2) + "</td>" +
      "<td>" + cost.toFixed(2) + "</td>" +
      "</tr>";
  }).join("") || emptyRow(9);
  document.getElementById("fuelTfoot").innerHTML = "<tr>" +
    '<td colspan="4">Totals (filtered)</td>' +
    "<td>" + loc(totL) + "</td>" +
    "<td>" + loc(totK) + "</td>" +
    "<td>" + (totL ? (totK / totL).toFixed(2) : "0.00") + "</td>" +
    "<td></td>" +
    "<td>" + totC.toFixed(2) + "</td>" +
    "</tr>";
  document.getElementById("fuelCount").textContent = "Showing " + rows.length + " of " + db.fuelLogs.length + " fills · fleet avg " + avg.toFixed(2) + " km/L";

  var agg = effAgg();
  var units = Object.keys(agg).sort();
  document.getElementById("effTbody").innerHTML = units.map(function (u) {
    var o = agg[u];
    var a = o.litres ? o.km / o.litres : 0;
    var dPct = avg ? (a - avg) / avg * 100 : 0;
    var cls = dPct >= 2 ? "green" : dPct <= -5 ? "red" : "grey";
    var txt = (dPct >= 0 ? "+" : "") + dPct.toFixed(1) + "%";
    return "<tr>" +
      '<td><b>' + esc(u) + "</b></td>" +
      "<td>" + o.fills + "</td>" +
      "<td>" + loc(o.litres) + "</td>" +
      "<td>" + loc(o.km) + "</td>" +
      "<td>" + a.toFixed(2) + "</td>" +
      "<td>" + o.cost.toFixed(2) + "</td>" +
      "<td>" + badge(txt, cls) + "</td>" +
      "</tr>";
  }).join("") || emptyRow(7);

  var drv = db.drivers.slice().sort(function (a, b) { return b.score - a.score; });
  document.getElementById("drvTbody").innerHTML = drv.map(function (x) {
    return "<tr>" +
      '<td><b>' + esc(x.name) + "</b></td>" +
      "<td>" + esc(x.depot) + "</td>" +
      "<td>" + x.trips + "</td>" +
      "<td>" + x.hb + "</td>" +
      "<td>" + x.spd + "</td>" +
      "<td>" + x.idle + "</td>" +
      "<td>" + x.ot + "%</td>" +
      "<td>" + scoreBadge(x.score) + "</td>" +
      "<td>" + flagBadge(x.score) + "</td>" +
      "</tr>";
  }).join("") || emptyRow(9);
}

/* ---------- compliance ---------- */
function permitsFiltered() {
  var c = document.getElementById("cptCountry").value;
  if (c === "all") return db.permits.slice().sort(function (a, b) { return a.expiry < b.expiry ? -1 : 1; });
  return db.permits.filter(function (p) { return p.country === c; });
}
function renderCompliance() {
  var rows = permitsFiltered();
  document.getElementById("cptTbody").innerHTML = rows.map(function (p) {
    var dl = daysUntil(p.expiry);
    return "<tr>" +
      '<td><b>' + esc(p.unit) + "</b></td>" +
      "<td>" + esc(p.country) + "</td>" +
      "<td>" + esc(p.ptype) + "</td>" +
      "<td>" + esc(p.ref) + "</td>" +
      "<td>" + fmtDate(p.issued) + "</td>" +
      "<td>" + fmtDate(p.expiry) + "</td>" +
      "<td>" + expiryBadge(dl) + "</td>" +
      '<td><button class="btn small ghost act-btn" data-act="renew" data-id="' + esc(p.id) + '" type="button">Renew +12m</button></td>' +
      "</tr>";
  }).join("") || emptyRow(8);
  document.getElementById("cptCount").textContent = "Showing " + rows.length + " of " + db.permits.length + " permits";

  var vs = db.vehicles.slice().sort(function (a, b) { return a.cof < b.cof ? -1 : 1; });
  document.getElementById("cofTbody").innerHTML = vs.map(function (v) {
    return "<tr>" +
      '<td><b>' + esc(v.id) + "</b></td>" +
      "<td>" + esc(v.depot) + "</td>" +
      "<td>" + fmtDate(v.cof) + "</td>" +
      "<td>" + expiryBadge(daysUntil(v.cof)) + "</td>" +
      "</tr>";
  }).join("") || emptyRow(4);
}

/* ---------- drivers & training ---------- */
function driversFiltered() {
  var q = (document.getElementById("drvSearch").value || "").toLowerCase().trim();
  if (!q) return db.drivers.slice().sort(function (a, b) { return b.score - a.score; });
  return db.drivers.filter(function (x) {
    return (x.name + " " + x.nat + " " + x.depot).toLowerCase().indexOf(q) !== -1;
  });
}
function renderDrivers() {
  var rows = driversFiltered();
  document.getElementById("drvRosterTbody").innerHTML = rows.map(function (x) {
    return "<tr>" +
      '<td><b>' + esc(x.name) + "</b><br><span class=\"note\">" + esc(x.id) + "</span></td>" +
      "<td>" + esc(x.nat) + "</td>" +
      "<td>" + esc(x.depot) + "</td>" +
      "<td>" + fmtDate(x.licEx) + " " + expiryBadge(daysUntil(x.licEx)) + "</td>" +
      "<td>" + fmtDate(x.pdpEx) + " " + expiryBadge(daysUntil(x.pdpEx)) + "</td>" +
      "<td>" + x.trips + "</td>" +
      "<td>" + statusBadge(x.status) + "</td>" +
      "<td>" + scoreBadge(x.score) + "</td>" +
      "</tr>";
  }).join("") || emptyRow(8);
  document.getElementById("drvCount").textContent = "Showing " + rows.length + " of " + db.drivers.length + " drivers";

  var tr = db.trainings.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  document.getElementById("trnTbody").innerHTML = tr.map(function (t) {
    return "<tr>" +
      "<td>" + fmtDate(t.date) + "</td>" +
      '<td><b>' + esc(t.driver) + "</b></td>" +
      "<td>" + esc(t.course) + "</td>" +
      "<td>" + fmtDate(t.valid) + "</td>" +
      "<td>" + badge(t.status, t.status === "Completed" ? "green" : "blue") + "</td>" +
      "</tr>";
  }).join("") || emptyRow(5);
}

/* ---------- incidents & claims ---------- */
function incidentsFiltered() {
  var s = document.getElementById("incSeverity").value;
  var arr = db.incidents.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  if (s === "all") return arr;
  return arr.filter(function (i) { return i.severity === s; });
}
function renderIncidents() {
  var rows = incidentsFiltered();
  document.getElementById("incTbody").innerHTML = rows.map(function (i) {
    var act = (i.claim === "Open" || i.claim === "Submitted")
      ? '<button class="btn small ghost act-btn" data-act="closeClaim" data-id="' + esc(i.id) + '" type="button">Close claim</button>'
      : '<span class="note">—</span>';
    return "<tr>" +
      '<td><b>' + esc(i.id) + "</b></td>" +
      "<td>" + fmtDate(i.date) + "</td>" +
      '<td><b>' + esc(i.unit) + "</b></td>" +
      "<td>" + esc(i.driver) + "</td>" +
      "<td>" + esc(i.itype) + "</td>" +
      "<td>" + esc(i.loc) + "</td>" +
      "<td>" + sevBadge(i.severity) + "</td>" +
      "<td>" + esc(i.injuries) + "</td>" +
      "<td>" + claimBadge(i.claim) + "</td>" +
      "<td>" + money(i.est) + "</td>" +
      "<td>" + act + "</td>" +
      "</tr>";
  }).join("") || emptyRow(11);
  document.getElementById("incCount").textContent = "Showing " + rows.length + " of " + db.incidents.length + " incidents";
}

/* ---------- budget & KPIs ---------- */
function renderBudget() {
  var bt = budgetTotals();
  var cpk = db.fleetKmYtd ? bt.a / db.fleetKmYtd : 0;
  var fuelRow = null;
  for (var i = 0; i < db.budget.length; i++) if (db.budget[i].short === "Fuel") { fuelRow = db.budget[i]; break; }
  var fuelShare = bt.a ? (fuelRow ? fuelRow.actual / bt.a * 100 : 0) : 0;
  document.getElementById("budKpis").innerHTML = [
    { l: "Total budget YTD", v: money(bt.b), s: "Jan–Nov 2026" },
    { l: "Total actual YTD", v: money(bt.a), s: bt.used.toFixed(1) + "% of budget used" },
    { l: "Variance", v: money(bt.variance), s: bt.variance >= 0 ? "under budget" : "over budget" },
    { l: "Cost per km", v: "US$ " + cpk.toFixed(2), s: loc(db.fleetKmYtd) + " km run" },
    { l: "Fuel share of costs", v: fuelShare.toFixed(1) + "%", s: "largest cost driver" }
  ].map(kpiCard).join("");
  animateKpis(document.getElementById("budKpis"));

  document.getElementById("budTbody").innerHTML = db.budget.map(function (r) {
    var va = r.budget - r.actual;
    var used = r.budget ? r.actual / r.budget * 100 : 0;
    return "<tr>" +
      "<td>" + esc(r.cat) + "</td>" +
      "<td>" + loc(r.budget) + "</td>" +
      "<td>" + loc(r.actual) + "</td>" +
      '<td class="' + (va < 0 ? "v-red" : "v-green") + '">' + (va >= 0 ? "+" : "") + loc(va) + "</td>" +
      "<td>" + badge(used.toFixed(0) + "%", used > 100 ? "red" : used > 95 ? "amber" : "green") + "</td>" +
      "</tr>";
  }).join("");
  document.getElementById("budTfoot").innerHTML = "<tr>" +
    "<td>Total</td><td>" + loc(bt.b) + "</td><td>" + loc(bt.a) + "</td>" +
    '<td class="' + (bt.variance < 0 ? "v-red" : "v-green") + '">' + (bt.variance >= 0 ? "+" : "") + loc(bt.variance) + "</td>" +
    "<td>" + bt.used.toFixed(1) + "%</td></tr>";
}

/* ---------- master render ---------- */
function renderAll() {
  renderDash();
  renderFleet();
  renderMaint();
  renderFuel();
  renderCompliance();
  renderDrivers();
  renderIncidents();
  renderBudget();
}

/* ============================================================
   Charts (canvas, no external libraries)
   ============================================================ */
function shortNum(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "k";
  return String(Math.round(n));
}
function prepCanvas(cv) {
  if (!cv || !cv.clientWidth) return null;
  var dpr = window.devicePixelRatio || 1;
  var w = cv.clientWidth, h = cv.clientHeight;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  var ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx: ctx, w: w, h: h };
}
function rr(ctx, x, y, w2, h2, r) {
  if (h2 <= 0) return;
  r = Math.min(r, w2 / 2, h2 / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w2, y, x + w2, y + h2, r);
  ctx.arcTo(x + w2, y + h2, x, y + h2, r);
  ctx.arcTo(x, y + h2, x, y, r);
  ctx.arcTo(x, y, x + w2, y, r);
  ctx.closePath();
}
function axes(ctx, w, padL, padT, ih, max) {
  ctx.strokeStyle = "rgba(151,168,196,.14)";
  ctx.fillStyle = "#8ea0ba";
  ctx.font = '10px "JetBrains Mono",monospace';
  for (var i = 0; i <= 4; i++) {
    var y = padT + ih - ih * i / 4;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - 10, y); ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillText(shortNum(max * i / 4), padL - 6, y + 3);
  }
}
function drawBars(cv, labels, values, color) {
  var p = prepCanvas(cv); if (!p) return;
  var ctx = p.ctx, w = p.w, h = p.h;
  var padL = 44, padB = 30, padT = 16;
  var ih = h - padT - padB, iw = w - padL - 12;
  var max = (Math.max.apply(null, values) * 1.15) || 1;
  axes(ctx, w, padL, padT, ih, max);
  var n = values.length, slot = iw / n, bw = Math.min(slot * 0.5, 46);
  for (var i = 0; i < n; i++) {
    var x = padL + slot * i + (slot - bw) / 2;
    var bh = ih * values[i] / max;
    var g = ctx.createLinearGradient(0, padT + ih - bh, 0, padT + ih);
    g.addColorStop(0, "#ffc94d"); g.addColorStop(1, "#ff6a2b");
    ctx.fillStyle = g;
    ctx.shadowColor = "rgba(255,150,40,.45)"; ctx.shadowBlur = 10;
    rr(ctx, x, padT + ih - bh, bw, Math.max(bh, 2), 4); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#eef3fb";
    ctx.font = 'bold 10px "JetBrains Mono",monospace'; ctx.textAlign = "center";
    ctx.fillText(shortNum(values[i]), x + bw / 2, padT + ih - bh - 6);
    ctx.fillStyle = "#8ea0ba";
    ctx.font = '10px "JetBrains Mono",monospace';
    var parts = String(labels[i]).split(" ");
    ctx.fillText(parts[0], x + bw / 2, padT + ih + 13);
    if (parts[1]) ctx.fillText(parts[1], x + bw / 2, padT + ih + 24);
  }
}
function drawGrouped(cv, labels, a, b, legendA, legendB) {
  var p = prepCanvas(cv); if (!p) return;
  var ctx = p.ctx, w = p.w, h = p.h;
  var padL = 44, padB = 40, padT = 16;
  var ih = h - padT - padB, iw = w - padL - 12;
  var max = (Math.max.apply(null, a.concat(b)) * 1.15) || 1;
  axes(ctx, w, padL, padT, ih, max);
  var n = labels.length, slot = iw / n, bw = Math.min(slot * 0.34, 30);
  for (var i = 0; i < n; i++) {
    var cx = padL + slot * i + slot / 2;
    var bh1 = ih * a[i] / max, bh2 = ih * b[i] / max;
    var g1 = ctx.createLinearGradient(0, padT + ih - bh1, 0, padT + ih);
    g1.addColorStop(0, "#6ea8ff"); g1.addColorStop(1, "#2456d8");
    ctx.fillStyle = g1;
    rr(ctx, cx - bw - 1, padT + ih - bh1, bw, Math.max(bh1, 2), 3); ctx.fill();
    var g2 = ctx.createLinearGradient(0, padT + ih - bh2, 0, padT + ih);
    g2.addColorStop(0, "#ffc94d"); g2.addColorStop(1, "#ff6a2b");
    ctx.fillStyle = g2;
    rr(ctx, cx + 1, padT + ih - bh2, bw, Math.max(bh2, 2), 3); ctx.fill();
    ctx.fillStyle = "#8ea0ba";
    ctx.font = '9px "JetBrains Mono",monospace'; ctx.textAlign = "center";
    ctx.fillText(labels[i], cx, padT + ih + 13);
  }
  ctx.font = '10px "JetBrains Mono",monospace';
  ctx.fillStyle = "#5a9bff"; rr(ctx, 44, 2, 9, 9, 2); ctx.fill();
  ctx.fillStyle = "#9aabc4"; ctx.textAlign = "left"; ctx.fillText(legendA, 57, 10);
  ctx.fillStyle = "#ff8a1e"; rr(ctx, 44 + ctx.measureText(legendA).width + 66, 2, 9, 9, 2); ctx.fill();
  ctx.fillStyle = "#9aabc4"; ctx.fillText(legendB, 44 + ctx.measureText(legendA).width + 79, 10);
}
function drawLine(cv, labels, values, color) {
  var p = prepCanvas(cv); if (!p) return;
  var ctx = p.ctx, w = p.w, h = p.h;
  var padL = 44, padB = 30, padT = 16;
  var ih = h - padT - padB, iw = w - padL - 12;
  var max = (Math.max.apply(null, values) * 1.15) || 1;
  var min = Math.min.apply(null, values) * 0.75;
  axes2(ctx, w, padL, padT, ih, max, min);
  var n = values.length;
  function px(i) { return padL + (n === 1 ? iw / 2 : iw * i / (n - 1)); }
  function py(v) { return padT + ih - ih * (v - min) / (max - min); }
  ctx.beginPath();
  for (var i = 0; i < n; i++) {
    var x = px(i), y = py(values[i]);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color; ctx.lineWidth = 2.5;
  ctx.shadowColor = "rgba(255,170,60,.5)"; ctx.shadowBlur = 11;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.lineTo(px(n - 1), padT + ih); ctx.lineTo(px(0), padT + ih); ctx.closePath();
  ctx.fillStyle = "rgba(255,170,60,.14)"; ctx.fill();
  for (var j = 0; j < n; j++) {
    ctx.beginPath(); ctx.arc(px(j), py(values[j]), 4, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = "#070d18"; ctx.stroke();
    ctx.fillStyle = "#eef3fb"; ctx.font = 'bold 10px "JetBrains Mono",monospace'; ctx.textAlign = "center";
    ctx.fillText(shortNum(values[j]), px(j), py(values[j]) - 9);
    ctx.fillStyle = "#8ea0ba"; ctx.font = '10px "JetBrains Mono",monospace';
    var parts = String(labels[j]).split(" ");
    ctx.fillText(parts[0], px(j), padT + ih + 13);
    if (parts[1]) ctx.fillText(parts[1], px(j), padT + ih + 24);
  }
}
function axes2(ctx, w, padL, padT, ih, max, min) {
  ctx.strokeStyle = "rgba(151,168,196,.14)";
  ctx.fillStyle = "#8ea0ba";
  ctx.font = '10px "JetBrains Mono",monospace';
  for (var i = 0; i <= 4; i++) {
    var v = min + (max - min) * i / 4;
    var y = padT + ih - ih * i / 4;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - 10, y); ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillText(shortNum(v), padL - 6, y + 3);
  }
}
function drawHBars(cv, labels, values) {
  var p = prepCanvas(cv); if (!p) return;
  var ctx = p.ctx, w = p.w, h = p.h;
  var padL = 96, padB = 8, padT = 6;
  var ih = h - padT - padB, iw = w - padL - 34;
  var n = labels.length, rh = ih / n;
  var max = 100;
  for (var i = 0; i < n; i++) {
    var y = padT + rh * i + 4;
    var bh = rh - 9;
    var bw2 = iw * values[i] / max;
    ctx.fillStyle = "rgba(148,163,184,.14)";
    rr(ctx, padL, y, iw, bh, 4); ctx.fill();
    var cls = values[i] >= 85 ? "#3be0a8" : values[i] >= 75 ? "#37c6f4" : values[i] >= 65 ? "#ffc24b" : "#ff6b81";
    ctx.fillStyle = cls;
    rr(ctx, padL, y, Math.max(bw2, 2), bh, 4); ctx.fill();
    ctx.fillStyle = "#cbd5e8";
    ctx.font = "10px 'Segoe UI',sans-serif"; ctx.textAlign = "right";
    ctx.fillText(labels[i], padL - 8, y + bh / 2 + 3);
    ctx.fillStyle = "#f1f5f9"; ctx.font = "bold 10px 'Segoe UI',sans-serif"; ctx.textAlign = "left";
    ctx.fillText(String(values[i]), padL + bw2 + 6, y + bh / 2 + 3);
  }
}
function drvLabel(name) {
  var parts = name.split(" ");
  return parts[0] + " " + (parts[1] ? parts[1].charAt(0) + "." : "");
}
function refreshCharts() {
  var view = currentView;
  if (view === "dash") {
    drawBars(document.getElementById("chFuel"),
      db.fuelTrend.map(function (r) { return r.month; }),
      db.fuelTrend.map(function (r) { return r.cost; }), "#ffc94d");
    drawGrouped(document.getElementById("chBudget"),
      db.budget.map(function (r) { return r.short; }),
      db.budget.map(function (r) { return r.budget; }),
      db.budget.map(function (r) { return r.actual; }),
      "Budget", "Actual");
    drawHBars(document.getElementById("chDrivers"),
      db.drivers.slice().sort(function (a, b) { return b.score - a.score; })
        .map(function (x) { return drvLabel(x.name); }),
      db.drivers.slice().sort(function (a, b) { return b.score - a.score; })
        .map(function (x) { return x.score; }));
  }
  if (view === "budget") {
    drawLine(document.getElementById("chFuelLine"),
      db.fuelTrend.map(function (r) { return r.month; }),
      db.fuelTrend.map(function (r) { return r.cost; }), "#ffc24b");
  }
}
