/* Atlas: the hero map. A dotted world drawn on canvas, with the career route,
   place pins and the conference-talks layer drawn in SVG on top. */
(function () {
  const stage = document.getElementById("atlas");
  if (!stage || !window.d3 || !window.topojson) return;

  const P = window.PLACES, ROUTE = window.ROUTE, WORKS = window.WORKS;
  const canvas = stage.querySelector("canvas");
  const svg = d3.select(stage.querySelector("svg"));
  const tip = stage.querySelector(".atlas-tip");
  const list = document.getElementById("route-list");
  const detail = document.getElementById("route-detail");
  const routeLabel = document.getElementById("route-label");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Label placement per place, so neighbours don't collide.
  const LABEL = { dhaka: [10, 18, "start"], chengdu: [-10, -12, "end"], norman: [-12, 4, "end"], washington: [12, -8, "start"] };

  let land = null, layer = "route", selected = null, drawnOnce = false, touched = false;
  const worksAt = id => WORKS.filter(w => w.place === id);
  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  // talks aggregated by city
  const talkCities = (() => {
    const m = new Map();
    (window.TALKS || []).forEach(([yr, city]) => {
      const c = m.get(city) || { id: city, name: TALK_CITIES[city][0], lon: TALK_CITIES[city][1], lat: TALK_CITIES[city][2], n: 0, years: new Set() };
      c.n++; c.years.add(yr); m.set(city, c);
    });
    return [...m.values()].sort((a, b) => b.n - a.n);
  })();

  /* ---------- route list (always rendered, works without the map) ---------- */
  function renderList() {
    list.innerHTML = "";
    if (layer === "route") {
      routeLabel.textContent = "The route";
      ROUTE.forEach((s, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<button type="button" data-i="${i}"><span class="r-place">${P[s.place].short || P[s.place].name}<small>${s.years}</small></span><span class="r-title">${s.title}</span></button>`;
        list.appendChild(li);
      });
      select(selected == null ? ROUTE.length - 1 : selected, false);
      if (!touched) highlightAll();
    } else {
      routeLabel.textContent = `${(window.TALKS || []).length} talks · ${talkCities.length} cities`;
      talkCities.slice(0, 6).forEach(c => {
        const li = document.createElement("li");
        const yrs = [...c.years].sort();
        li.innerHTML = `<button type="button" data-city="${c.id}"><span class="r-place">${c.name}<small>${c.n} talk${c.n > 1 ? "s" : ""}</small></span><span class="r-title">${yrs[0]}${yrs.length > 1 ? "–" + yrs[yrs.length - 1] : ""}</span></button>`;
        list.appendChild(li);
      });
      detail.innerHTML = `<p style="margin:0">Circles are sized by the number of talks given in each city. Hover a circle for details, or see every talk in <a href="#research">Research</a>.</p>`;
    }
  }

  list.addEventListener("mouseover", e => { touched = true; const b = e.target.closest("button"); if (b && b.dataset.i) highlight(+b.dataset.i); if (b && b.dataset.city) highlightCity(b.dataset.city); });
  list.addEventListener("focusin", e => { const b = e.target.closest("button"); if (b && b.dataset.i) highlight(+b.dataset.i); if (b && b.dataset.city) highlightCity(b.dataset.city); });
  list.addEventListener("mouseleave", () => { layer === "route" ? highlight(selected) : highlightCity(null); });
  list.addEventListener("click", e => { const b = e.target.closest("button"); if (b && b.dataset.i) select(+b.dataset.i, true); });

  function select(i, user) {
    selected = i;
    if (user) touched = true;
    list.querySelectorAll("button").forEach(b => b.classList.toggle("on", +b.dataset.i === i));
    const s = ROUTE[i], w = worksAt(s.place).concat((s.also || []).map(id => WORKS.find(x => x.id === id)).filter(Boolean));
    detail.innerHTML = `<ul>${s.lines.map(l => `<li>${l}</li>`).join("")}</ul>` +
      (w.length ? `<div class="works">${w.map(x => `<a class="chip" href="#${anchorFor(x)}"><span class="dot ${x.medium}"></span>${x.title}</a>`).join("")}</div>` : "");
    highlight(i);
  }

  function anchorFor(w) {
    return { "race-to-refuge": "race-to-refuge", "cross-roads": "audio" }[w.id] || "w-" + w.id;
  }
  window.anchorFor = anchorFor;

  /* ---------- map ---------- */
  let proj, path, W, H;

  function draw() {
    const r = stage.getBoundingClientRect();
    W = Math.round(r.width); H = Math.round(r.height);
    if (!W || !H) return;
    proj = d3.geoEqualEarth().fitExtent([[4, 4], [W - 4, H - 4]], land);
    path = d3.geoPath(proj);
    drawDots();
    drawSvg();
  }

  function drawDots() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    // rasterise land once at 1x into an offscreen canvas, then sample a grid
    const off = document.createElement("canvas"); off.width = W; off.height = H;
    const o = off.getContext("2d");
    o.fillStyle = "#000"; o.beginPath(); d3.geoPath(proj, o)(land); o.fill();
    const px = o.getImageData(0, 0, W, H).data;
    const step = Math.max(5, Math.round(W / 170)), rad = step * 0.3;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = cssVar("--land");
    for (let y = step / 2; y < H; y += step) {
      for (let x = step / 2; x < W; x += step) {
        if (px[(Math.floor(y) * W + Math.floor(x)) * 4 + 3] > 128) { ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832); ctx.fill(); }
      }
    }
  }

  function arcPath(a, b) {
    const [x1, y1] = proj([P[a].lon, P[a].lat]), [x2, y2] = proj([P[b].lon, P[b].lat]);
    const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
    const lift = Math.min(d * 0.32, H * 0.42);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    // bend toward the top of the map
    const nx = -dy / d, ny = dx / d, s = ny > 0 ? -1 : 1;
    return `M${x1},${y1} Q${mx + nx * lift * s},${my + ny * lift * s} ${x2},${y2}`;
  }

  function drawSvg() {
    svg.attr("viewBox", `0 0 ${W} ${H}`);
    svg.selectAll("g").remove();
    const gArcs = svg.append("g").attr("class", "arcs");
    const gTalks = svg.append("g").attr("class", "talks");
    const gPins = svg.append("g").attr("class", "pins");

    // arcs: one per route stop that moves to a new place
    ROUTE.forEach((s, i) => {
      if (i === 0) return;
      const from = s.from || ROUTE[i - 1].place;
      if (from === s.place) return;
      gArcs.append("path").attr("class", "arc" + (s.place === "washington" ? " side" : "")).attr("data-i", i).attr("d", arcPath(from, s.place));
    });

    // talks
    const rScale = d3.scaleSqrt().domain([1, d3.max(talkCities, c => c.n)]).range([3.5, Math.max(10, W / 60)]);
    gTalks.selectAll("circle").data(talkCities).join("circle")
      .attr("class", "talk").attr("data-city", d => d.id)
      .attr("cx", d => proj([d.lon, d.lat])[0]).attr("cy", d => proj([d.lon, d.lat])[1]).attr("r", d => rScale(d.n))
      .on("mouseenter", (e, d) => { highlightCity(d.id); showTip(e, `<b>${d.name}</b><span class="meta">${d.n} talk${d.n > 1 ? "s" : ""} · ${[...d.years].sort().join(", ")}</span>`); })
      .on("mouseleave", () => { highlightCity(null); hideTip(); });

    // pins
    Object.keys(P).forEach(id => {
      const [x, y] = proj([P[id].lon, P[id].lat]);
      const n = worksAt(id).length, r = 4.5 + Math.sqrt(n) * 1.6;
      const g = gPins.append("g").attr("class", "pin-g").attr("data-place", id).attr("transform", `translate(${x},${y})`);
      g.append("circle").attr("class", "pin-ring").attr("r", r + 2);
      g.append("circle").attr("class", "pin").attr("r", r);
      const [lx, ly, anchor] = LABEL[id];
      g.append("text").attr("class", "pin-label").attr("x", lx).attr("y", ly).attr("text-anchor", anchor).text(P[id].short || P[id].name);
      g.append("circle").attr("class", "pin-hit").attr("r", 18).attr("tabindex", 0).attr("role", "button")
        .attr("aria-label", `${P[id].name}: ${n} pieces of work`)
        .on("mouseenter focus", e => {
          const stops = ROUTE.filter(s => s.place === id);
          const ws = worksAt(id);
          showTip(e, `<b>${P[id].name}</b><span class="meta">${stops.map(s => s.years).join(" · ")}</span>` +
            (ws.length ? `<ul>${ws.map(w => `<li>${w.title}</li>`).join("")}</ul>` : `<ul>${stops[0].lines.slice(0, 2).map(l => `<li>${l}</li>`).join("")}</ul>`));
        })
        .on("mouseleave blur", hideTip)
        .on("click keydown", e => {
          if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
          if (layer !== "route") setLayer("route");
          const idx = ROUTE.map((s, i) => [s, i]).filter(([s]) => s.place === id).pop()[1];
          select(idx, true);
        });
    });

    applyLayer();
    if (!drawnOnce) { drawnOnce = true; animateIn(); } else highlight(selected);
  }

  function animateIn() {
    if (reduced) { highlight(selected); return; }
    const arcs = svg.selectAll(".arc").nodes();
    arcs.forEach((p, k) => {
      const L = p.getTotalLength();
      const dash = p.classList.contains("side") ? null : `${L} ${L}`;
      d3.select(p).attr("stroke-dasharray", dash || `${L} ${L}`).attr("stroke-dashoffset", L)
        .transition().delay(500 + k * 650).duration(1100).ease(d3.easeCubicInOut).attr("stroke-dashoffset", 0)
        .on("end", function () { if (this.classList.contains("side")) d3.select(this).attr("stroke-dasharray", null); });
    });
    svg.selectAll(".pin-g").attr("opacity", 0).transition().delay((d, i) => 250 + i * 220).duration(500).attr("opacity", 1);
    setTimeout(() => highlight(selected), 600 + arcs.length * 650 + 1100);
  }

  function highlightAll() {
    svg.selectAll(".arc").classed("dim", false);
    svg.selectAll(".pin-g").attr("opacity", 1);
  }

  function highlight(i) {
    if (i == null || layer !== "route") return;
    if (!touched) return highlightAll();
    const s = ROUTE[i];
    svg.selectAll(".arc").classed("dim", function () { return +this.dataset.i !== i; });
    if (!svg.selectAll(".arc").filter(function () { return +this.dataset.i === i; }).size()) svg.selectAll(".arc").classed("dim", false);
    svg.selectAll(".pin-g").attr("opacity", function () { return this.dataset.place === s.place ? 1 : 0.55; });
  }

  function highlightCity(id) {
    svg.selectAll(".talk").classed("on", function () { return this.dataset.city === id; });
    list.querySelectorAll("button[data-city]").forEach(b => b.classList.toggle("on", b.dataset.city === id));
  }

  function applyLayer() {
    const talks = layer === "talks";
    svg.select(".talks").attr("display", talks ? null : "none");
    svg.select(".arcs").attr("opacity", talks ? 0.12 : 1);
    svg.select(".pins").attr("opacity", talks ? 0.35 : 1).style("pointer-events", talks ? "none" : null);
  }

  function setLayer(l) {
    layer = l;
    document.querySelectorAll(".seg button").forEach(b => b.setAttribute("aria-pressed", b.dataset.layer === l));
    renderList(); applyLayer();
    if (l === "route") highlight(selected);
  }
  document.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", () => setLayer(b.dataset.layer)));
  window.showTalksLayer = () => setLayer("talks");

  function showTip(e, html) {
    tip.innerHTML = html;
    const r = stage.getBoundingClientRect();
    const t = e.target.getBoundingClientRect();
    let x = t.left + t.width / 2 - r.left + 14, y = t.top + t.height / 2 - r.top - 10;
    tip.classList.add("show");
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    if (x + tw > r.width) x = x - tw - 28;
    if (y + th > r.height) y = r.height - th;
    tip.style.left = Math.max(0, x) + "px"; tip.style.top = Math.max(0, y) + "px";
  }
  function hideTip() { tip.classList.remove("show"); }

  renderList();

  if (!window.WORLD) { stage.style.display = "none"; return; }
  const geoms = WORLD.objects.countries.geometries.filter(g => g.id !== "010"); // drop Antarctica
  land = topojson.merge(WORLD, geoms);
  draw();
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(draw, 150); });
  document.addEventListener("themechange", () => drawDots());
})();
