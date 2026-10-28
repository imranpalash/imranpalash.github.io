/* Page behaviour: theme, navigation, work index and timeline, video pop-up,
   podcast player, talks chart and small interactions. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const WORKS = window.WORKS || [];
  const MEDIA = { interactive: "Interactive & data", video: "Video", audio: "Audio" };
  const anchor = w => (window.anchorFor ? window.anchorFor(w) : "w-" + w.id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- theme ---------- */
  const themeBtn = $(".theme-btn");
  const sun = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const moon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  function paintThemeBtn() {
    const light = document.documentElement.dataset.theme === "light";
    themeBtn.innerHTML = light ? moon : sun;
    themeBtn.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    $('meta[name="theme-color"]').content = light ? "#f6f1ea" : "#0d0e12";
  }
  themeBtn.addEventListener("click", () => {
    const light = document.documentElement.dataset.theme !== "light";
    if (light) document.documentElement.dataset.theme = "light"; else delete document.documentElement.dataset.theme;
    try { localStorage.setItem("theme", light ? "light" : "dark"); } catch (e) {}
    paintThemeBtn();
    document.dispatchEvent(new Event("themechange"));
  });
  paintThemeBtn();

  /* ---------- header, menu, active section ---------- */
  const head = $(".site-head"), menuBtn = $(".menu-btn"), nav = $("#nav");
  const onScroll = () => head.classList.toggle("scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", e => { if (e.target.closest("a")) { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); } });

  const navLinks = $$(".nav a");
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["work", "teaching", "research", "ai", "about", "contact"].forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });

  /* ---------- reveal on scroll ---------- */
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rev = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.remove("pre"); rev.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
  const prepReveal = el => {
    if (reduceMotion || el.getBoundingClientRect().top < innerHeight) return;   // already on screen: leave visible
    el.classList.add("pre"); rev.observe(el);
  };
  $$(".reveal").forEach(prepReveal);

  /* ---------- work index: filters, list, timeline ---------- */
  let filter = "all";
  const filtersEl = $("#filters"), listEl = $("#index-list");
  const counts = WORKS.reduce((m, w) => (m[w.medium] = (m[w.medium] || 0) + 1, m), {});
  filtersEl.innerHTML = `<button type="button" data-f="all" aria-pressed="true">All <span class="count">${WORKS.length}</span></button>` +
    Object.keys(MEDIA).map(k => `<button type="button" data-f="${k}" aria-pressed="false"><span class="dot ${k}"></span>${MEDIA[k]} <span class="count">${counts[k] || 0}</span></button>`).join("");
  filtersEl.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    filter = b.dataset.f;
    $$("button", filtersEl).forEach(x => x.setAttribute("aria-pressed", x === b));
    applyFilter();
  });

  const sorted = [...WORKS].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  listEl.innerHTML = sorted.map(w => {
    const place = (window.PLACES[w.place] || {}).short || (window.PLACES[w.place] || {}).name || "";
    return `<li data-m="${w.medium}" data-id="${w.id}"><a href="#${anchor(w)}">
      <span class="y">${w.year}</span>
      <span class="t">${esc(w.title)}<small>${esc(w.format)}${w.students ? " · with students" : ""}</small></span>
      <span class="m"><span class="dot ${w.medium}"></span>${MEDIA[w.medium]}</span>
      <span class="p">${esc(place)}</span>
      <span class="arr" aria-hidden="true">→</span></a></li>`;
  }).join("");

  function applyFilter() {
    $$("li", listEl).forEach(li => li.hidden = filter !== "all" && li.dataset.m !== filter);
    window.d3 && d3.selectAll("#timeline .mark").classed("off", d => filter !== "all" && d.medium !== filter);
  }

  function drawTimeline() {
    const host = $("#timeline"); if (!window.d3 || !host) return;
    const tipEl = $(".tip", host);
    d3.select(host).select("svg").remove();
    const W = Math.max(320, host.clientWidth - 20), small = W < 600;
    const rows = Object.keys(MEDIA), rowH = small ? 46 : 54, top = 34, left = small ? 8 : 150, right = 18;
    const H = top + rows.length * rowH + 30;
    const x = d3.scaleLinear().domain([2014.5, 2027]).range([left, W - right]);
    const y = m => top + rows.indexOf(m) * rowH + rowH / 2;
    const svg = d3.select(host).insert("svg", ".tip").attr("viewBox", `0 0 ${W} ${H}`).attr("role", "img")
      .attr("aria-label", "Timeline of work by year and medium. The same pieces are listed below.");

    // eras: where the work was made
    const eras = [[2014.5, 2015.6, "Dhaka"], [2015.6, 2023, "Oklahoma"], [2023, 2024, "Dhaka"], [2024, 2026, "Chengdu"], [2026, 2027, "Dhaka"]];
    const ge = svg.append("g").attr("class", "era");
    eras.forEach(([a, b, name], i) => {
      ge.append("rect").attr("x", x(a)).attr("y", 6).attr("width", Math.max(0, x(b) - x(a) - 2)).attr("height", 18).attr("rx", 3).attr("opacity", i % 2 ? 0.55 : 1);
      if (x(b) - x(a) > name.length * 7.5 + 14) ge.append("text").attr("x", x(a) + 7).attr("y", 19).text(name);
    });

    const grid = svg.append("g").attr("class", "grid");
    rows.forEach(m => grid.append("line").attr("x1", left).attr("x2", W - right).attr("y1", y(m)).attr("y2", y(m)));
    if (!small) rows.forEach(m => svg.append("text").attr("class", "row-label").attr("x", 0).attr("y", y(m) + 4).text(MEDIA[m]));

    const years = d3.range(2015, 2027, small ? 2 : 1);
    svg.append("g").attr("class", "axis").selectAll("text").data(years).join("text")
      .attr("x", d => x(d)).attr("y", H - 6).attr("text-anchor", "middle").text(d => small ? "’" + String(d).slice(2) : d);

    const nowX = x(2026.8);
    const gn = svg.append("g").attr("class", "now");
    gn.append("line").attr("x1", nowX).attr("x2", nowX).attr("y1", top - 4).attr("y2", H - 22);

    // spread pieces that share a year and medium
    const groups = d3.group(WORKS, w => w.year + w.medium);
    const pos = new Map();
    groups.forEach(arr => arr.forEach((w, i) => pos.set(w.id, w.year + (i - (arr.length - 1) / 2) * 0.22)));

    const sym = { interactive: d3.symbolCircle, video: d3.symbolSquare, audio: d3.symbolTriangle };
    const size = small ? 150 : 210;
    svg.append("g").selectAll("path").data(WORKS).join("path")
      .attr("class", d => "mark " + d.medium)
      .attr("d", d => d3.symbol(sym[d.medium], size)())
      .attr("transform", d => `translate(${x(pos.get(d.id))},${y(d.medium)})`)
      .attr("tabindex", 0).attr("role", "link").attr("aria-label", d => `${d.title}, ${d.year}`)
      .on("mouseenter focus", (e, d) => {
        tipEl.innerHTML = `<b>${esc(d.title)}</b><span class="meta">${d.year} · ${esc(d.format)}</span>`;
        tipEl.classList.add("show");
        const hr = host.getBoundingClientRect(), r = e.target.getBoundingClientRect();
        let lx = r.left - hr.left + r.width / 2 + 12; const tw = tipEl.offsetWidth;
        if (lx + tw > hr.width) lx = r.left - hr.left - tw - 12;
        tipEl.style.left = lx + "px"; tipEl.style.top = (r.top - hr.top - 8) + "px";
        const row = listEl.querySelector(`li[data-id="${d.id}"] a`); row && row.classList.add("hl");
      })
      .on("mouseleave blur", (e, d) => { tipEl.classList.remove("show"); const row = listEl.querySelector(`li[data-id="${d.id}"] a`); row && row.classList.remove("hl"); })
      .on("click keydown", (e, d) => {
        if (e.type === "keydown" && e.key !== "Enter") return;
        const el = document.getElementById(anchor(d)); el && el.scrollIntoView({ behavior: "smooth" });
      });
    applyFilter();
  }
  drawTimeline();

  /* ---------- video reel + lightbox ---------- */
  const reel = $("#reel");
  const playIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>';
  const vids = WORKS.filter(w => w.medium === "video");
  // A title card for films with no still or public link yet: a grid of near-identical "photographs".
  const poster = w => `<span class="poster" aria-hidden="true"><span class="pgrid">${"<i></i>".repeat(30)}</span><span class="ptitle">${esc(w.title)}</span></span>`;
  const thumb = w => w.youtube
    ? `<button class="thumb" type="button" data-yt="${w.youtube}" data-title="${esc(w.title)}" aria-label="Play ${esc(w.title)}">
        ${w.img ? `<img src="${w.img}" alt="${esc(w.alt)}" loading="lazy">` : poster(w)}
        <span class="badge"><span class="dot video"></span>${esc(w.format)}</span>
        <span class="play">${playIcon}</span>
      </button>`
    : `<div class="thumb">${w.img ? `<img src="${w.img}" alt="${esc(w.alt)}" loading="lazy">` : poster(w)}
        <span class="badge"><span class="dot video"></span>${esc(w.format)}</span>
      </div>`;
  const card = (w, lead) => `<article class="card${lead ? " lead" : ""}${w.ai ? " compact" : ""}" id="w-${w.id}">
      ${thumb(w)}
      <div class="card-text">
      <h3>${esc(w.title)}</h3>
      <p class="meta">${w.year} · ${esc(w.context)}</p>
      <p>${esc(w.blurb)}</p>
      ${w.role ? `<p class="credit">${esc(w.role)}.</p>` : ""}
      ${w.ai ? `<a class="go" href="#ai">More in the AI section</a>` : ""}
      </div>
    </article>`;
  if (reel) {
    // Left column: the featured documentary, then AI-made work. Right column: the student news packages.
    const lead = vids.find(v => v.featured), ai = vids.filter(v => v.ai), rest = vids.filter(v => v !== lead && !v.ai && !v.lab);
    reel.innerHTML = `<div class="reveal lead-col">${card(lead, true)}${ai.map(w => card(w)).join("")}</div><div class="side reveal">${rest.map(w => card(w)).join("")}</div>`;
    const lab = $("#lab-reel");
    if (lab) lab.innerHTML = vids.filter(v => v.lab).map(w => card(w)).join("");
    $$(".reveal", reel).forEach(prepReveal);
  }

  const lb = $("#lightbox"), lbVid = $(".vid", lb), lbTitle = $(".cap b", lb), lbClose = $(".cap button", lb);
  let lastFocus = null;
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-yt]"); if (!t) return;
    // YouTube refuses to play embeds on pages opened from disk (Error 153: no referrer), so open YouTube itself there.
    if (location.protocol === "file:") { window.open("https://www.youtube.com/watch?v=" + t.dataset.yt, "_blank", "noopener"); return; }
    lastFocus = t;
    lbVid.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${t.dataset.yt}?autoplay=1&rel=0&origin=${encodeURIComponent(location.origin)}" title="${t.dataset.title}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    lbTitle.textContent = t.dataset.title;
    lb.classList.add("open"); document.body.style.overflow = "hidden"; lbClose.focus();
  });
  const closeLb = () => { lb.classList.remove("open"); lbVid.innerHTML = ""; document.body.style.overflow = ""; lastFocus && lastFocus.focus(); };
  lbClose.addEventListener("click", closeLb);
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && lb.classList.contains("open")) closeLb(); });

  /* ---------- public talks ---------- */
  const apHost = $("#appearances");
  if (apHost) {
    apHost.innerHTML = (window.APPEARANCES || []).map(a => `<article class="card appearance">
      <button class="thumb" type="button" data-yt="${a.youtube}" data-title="${esc(a.title)}" aria-label="Play ${esc(a.title)}">
        <img src="https://i.ytimg.com/vi/${a.youtube}/hqdefault.jpg" alt="" loading="lazy">
        <span class="badge">${esc(a.kind)}</span>
        <span class="play">${playIcon}</span>
      </button>
      <p class="meta">${esc(a.outlet)}</p>
      <h3>${esc(a.title)}</h3>
      <p class="meta">${esc(a.date)} · ${esc(a.length)}</p>
    </article>`).join("");
  }

  /* ---------- podcast ---------- */
  const eps = window.EPISODES || [], epList = $("#eplist"), scHost = $("#sc-host");
  const pIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>';
  const zIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
  if (epList) {
    epList.innerHTML = eps.map((ep, i) => `<li><button type="button" data-i="${i}" aria-label="Play episode ${ep.n}">
      <span class="pp">${pIcon}</span><span class="t">Episode ${ep.n}<small>America's Cross-Roads</small></span><span class="d">${ep.dur}</span>
      <span class="bar"><i></i></span></button></li>`).join("");
  }
  let widget = null, current = -1, playing = false, pending = null;
  const trackUrl = ep => `https://api.soundcloud.com/tracks/${ep.track}?secret_token=${ep.token}`;
  function paintEps() {
    $$("button", epList).forEach((b, i) => {
      const on = i === current;
      b.classList.toggle("on", on);
      $(".pp", b).innerHTML = on && playing ? zIcon : pIcon;
      b.setAttribute("aria-label", (on && playing ? "Pause" : "Play") + " episode " + eps[i].n);
    });
  }
  function loadWidget(cb) {
    if (widget) return cb();
    const s = document.createElement("script");
    s.src = "https://w.soundcloud.com/player/api.js";
    s.onload = () => {
      const ifr = document.createElement("iframe");
      ifr.allow = "autoplay"; ifr.title = "SoundCloud player"; ifr.width = "100%"; ifr.height = "166";
      ifr.src = "https://w.soundcloud.com/player/?url=" + encodeURIComponent(trackUrl(eps[current])) + "&auto_play=true&color=%23841617&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&hide_related=true";
      scHost.appendChild(ifr);
      widget = SC.Widget(ifr);
      widget.bind(SC.Widget.Events.READY, () => { widget.play(); });
      widget.bind(SC.Widget.Events.PLAY, () => { playing = true; clearTimeout(pending); paintEps(); });
      widget.bind(SC.Widget.Events.PAUSE, () => { playing = false; paintEps(); });
      widget.bind(SC.Widget.Events.FINISH, () => { playing = false; paintEps(); });
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, p => { const i = $(`button[data-i="${current}"] .bar i`, epList); if (i) i.style.width = (p.relativePosition * 100) + "%"; });
      // If the browser blocks playback in the hidden player, show SoundCloud's own player instead.
      pending = setTimeout(() => { if (!playing) { scHost.style.cssText = "position:static;width:auto;height:auto;margin-top:14px"; } }, 3500);
    };
    document.head.appendChild(s);
  }
  epList && epList.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const i = +b.dataset.i;
    if (i === current && widget) { widget.toggle(); return; }
    current = i; playing = false; paintEps();
    if (!widget) loadWidget(() => {});
    else { widget.load(trackUrl(eps[i]), { auto_play: true, show_comments: false, show_user: false, visual: false }); }
  });

  // decorative waveform on the cover
  const wave = $("#cover-wave");
  if (wave) {
    let d = "", seed = 7;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 64; i++) {
      const h = 18 + Math.abs(Math.sin(i * 0.37) * 70) + rnd() * 60, xx = 8 + i * 6.1;
      d += `<rect x="${xx}" y="${150 - h / 2}" width="3" height="${h}" rx="1.5" fill="#c23a3b" opacity="${0.25 + rnd() * 0.6}"/>`;
    }
    wave.innerHTML = d;
  }

  /* ---------- talks chart ---------- */
  const TALKS = window.TALKS || [], talkList = $("#talk-list"), chartHost = $("#talk-chart");
  function listTalks(year) {
    const rows = TALKS.filter(t => !year || t[0] === year);
    talkList.innerHTML = (year ? `<p class="meta" style="border:0;padding-bottom:0">${rows.length} talk${rows.length > 1 ? "s" : ""} in ${year} · <a href="#" data-all>show all</a></p>` : "") +
      rows.map(t => `<p>${esc(t[2])}<span class="meta">${t[0]} · ${esc(t[3])} · ${esc(TALK_CITIES[t[1]][0])}</span></p>`).join("");
  }
  talkList && talkList.addEventListener("click", e => { if (e.target.closest("[data-all]")) { e.preventDefault(); listTalks(null); d3.selectAll("#talk-chart .bar").classed("on", false); } });
  function drawTalks() {
    if (!window.d3 || !chartHost) return;
    const tipEl = $(".tip", chartHost);
    d3.select(chartHost).select("svg").remove();
    const W = Math.max(280, chartHost.clientWidth - 32), H = 190, pad = { t: 18, r: 4, b: 22, l: 4 };
    const yrs = d3.range(2014, 2027), byYear = d3.rollup(TALKS, v => v.length, t => t[0]);
    const data = yrs.map(y => ({ y, n: byYear.get(y) || 0 }));
    const x = d3.scaleBand().domain(yrs).range([pad.l, W - pad.r]).padding(0.28);
    const yS = d3.scaleLinear().domain([0, d3.max(data, d => d.n)]).range([H - pad.b, pad.t]);
    const svg = d3.select(chartHost).insert("svg", ".tip").attr("viewBox", `0 0 ${W} ${H}`).attr("role", "img").attr("aria-label", "Bar chart of conference talks per year, 2014 to 2026. Every talk is listed below.");
    svg.append("line").attr("class", "base").attr("x1", pad.l).attr("x2", W - pad.r).attr("y1", H - pad.b).attr("y2", H - pad.b);
    const r = Math.min(4, x.bandwidth() / 2);
    svg.append("g").selectAll("path").data(data.filter(d => d.n)).join("path").attr("class", "bar")
      .attr("d", d => { const x0 = x(d.y), w = x.bandwidth(), y0 = yS(d.n), b = H - pad.b; return `M${x0},${b}V${y0 + r}Q${x0},${y0} ${x0 + r},${y0}H${x0 + w - r}Q${x0 + w},${y0} ${x0 + w},${y0 + r}V${b}Z`; })
      .attr("tabindex", 0).attr("role", "button").attr("aria-label", d => `${d.y}: ${d.n} talks`)
      .on("mouseenter focus", (e, d) => {
        tipEl.innerHTML = `<b>${d.y}</b>${d.n} talk${d.n > 1 ? "s" : ""}`; tipEl.classList.add("show");
        const hr = chartHost.getBoundingClientRect(), br = e.target.getBoundingClientRect();
        let lx = br.left - hr.left + br.width + 8; if (lx + tipEl.offsetWidth > hr.width) lx = br.left - hr.left - tipEl.offsetWidth - 8;
        tipEl.style.left = lx + "px"; tipEl.style.top = (br.top - hr.top) + "px";
      })
      .on("mouseleave blur", () => tipEl.classList.remove("show"))
      .on("click keydown", function (e, d) {
        if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        d3.selectAll("#talk-chart .bar").classed("on", false); d3.select(this).classed("on", true); listTalks(d.y);
      });
    svg.append("g").selectAll("text").data(data.filter(d => d.n >= 1)).join("text").attr("class", "val")
      .attr("x", d => x(d.y) + x.bandwidth() / 2).attr("y", d => yS(d.n) - 5).attr("text-anchor", "middle").text(d => d.n);
    svg.append("g").attr("class", "axis").selectAll("text").data(yrs.filter((y, i) => W > 420 || i % 2 === 0)).join("text")
      .attr("x", d => x(d) + x.bandwidth() / 2).attr("y", H - 5).attr("text-anchor", "middle").text(d => "’" + String(d).slice(2));
  }
  if (talkList) { listTalks(null); drawTalks(); }

  $$("[data-show-talks]").forEach(a => a.addEventListener("click", () => window.showTalksLayer && window.showTalksLayer()));

  /* ---------- redraw charts on resize ---------- */
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { drawTimeline(); drawTalks(); }, 150); });

  /* ---------- small interactions ---------- */
  $$(".frame .load").forEach(b => b.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = b.dataset.embed; f.title = "Interactive map: Shooting Fatalities in the U.S."; f.loading = "lazy";
    b.parentElement.appendChild(f); b.remove();
  }));
  const outcome = $(".scene .outcome");
  $$(".scene .choices button").forEach(b => b.addEventListener("click", () => { outcome.classList.add("show"); $("a", outcome).focus(); }));

  /* ---------- contact form ---------- */
  const form = $("#contact-form");
  if (form) {
    const status = $("#cf-status"), btn = $("button[type=submit]", form);
    const say = (msg, kind) => { status.textContent = msg; status.className = "form-status meta " + (kind || ""); };
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if ($("#cf-hp").value) return;                       // a bot filled the hidden field
      let bad = null;
      [["#cf-name", v => v.trim().length > 0], ["#cf-email", v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())], ["#cf-message", v => v.trim().length > 0]]
        .forEach(([sel, ok]) => { const el = $(sel), valid = ok(el.value); el.setAttribute("aria-invalid", !valid); if (!valid && !bad) bad = el; });
      if (bad) { say(bad.id === "cf-email" ? "Please enter a valid email address so I can reply." : "Please fill in your name, email and message.", "err"); bad.focus(); return; }
      const cfg = window.CONTACT_FORM || {};
      if (!cfg.accessKey) { say("The form isn't connected yet, so this message wasn't sent.", "err"); return; }
      btn.disabled = true; say("Sending…");
      try {
        const res = await fetch(cfg.endpoint, {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: cfg.accessKey, subject: "imranhasnat.com: " + $("#cf-topic").value,
            from_name: "imranhasnat.com", name: $("#cf-name").value.trim(), email: $("#cf-email").value.trim(),
            topic: $("#cf-topic").value, message: $("#cf-message").value.trim(), botcheck: ""
          })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) throw new Error(data.message || "Request failed");
        form.reset(); say("Thanks. Your message was sent, and I'll reply by email.", "ok");
      } catch (err) {
        say("Your message couldn't be sent. Please check your connection and try again.", "err");
      } finally { btn.disabled = false; }
    });
  }

  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();
})();
