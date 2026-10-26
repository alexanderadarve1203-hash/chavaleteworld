let lang = "en";
const t = (k) => T[lang][k];

function applyLang(next) {
  lang = next;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-t]").forEach((e) => {
    e.textContent = t(e.dataset.t);
  });
  document.querySelectorAll("[data-h]").forEach((e) => {
    e.innerHTML = t(e.dataset.h);
  });
  document.querySelectorAll("[data-aria]").forEach((e) => {
    e.setAttribute("aria-label", t(e.dataset.aria));
  });
  document.querySelectorAll("[data-only]").forEach((e) => {
    e.hidden = e.dataset.only !== lang;
  });
  document
    .querySelectorAll(".lang button")
    .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  document.title =
    lang === "es" ? "ChavaleteWorld | Tu biblioteca de palabras" : "ChavaleteWorld | Your word library";
  try {
    localStorage.setItem("cw-lang", lang);
  } catch (e) {}
  demo.reset();
}

const $ = (id) => document.getElementById(id);
const ui = {
  where: $("p-where"),
  change: $("p-change"),
  minus: $("p-minus"),
  plus: $("p-plus"),
  secs: $("p-secs"),
  clock: $("p-clock"),
  word: $("p-word"),
  pron: $("p-pron"),
  barWrap: $("p-bar-wrap"),
  bar: $("p-bar"),
  panel: $("p-panel"),
  ptitle: $("p-ptitle"),
  ptext: $("p-ptext"),
  ver: $("p-ver"),
  cont: $("p-cont"),
  yn: $("p-yn"),
  si: $("p-si"),
  no: $("p-no"),
  stats: $("p-stats"),
};

const demo = (() => {
  let state = new Map(),
    folderIndex = 0,
    current = null,
    duration = 15,
    timeLeft = 15,
    clockOn = true;
  let counting = false,
    timeUp = false,
    forgetPending = false,
    last = 0,
    today = 0,
    correct = 0;

  const folders = () => DECKS[lang];
  const names = () => Object.keys(folders());

  function info(word) {
    if (!state.has(word.w)) state.set(word.w, { status: "new", streak: 0, forgot: 0, seen: false });
    return state.get(word.w);
  }

  function pick(list) {
    const weights = list.map((x) => {
      const s = info(x);
      let wgt = 3;
      if (s.status === "forgotten") wgt = 5 + Math.min(s.forgot, 5);
      else if (s.status === "known") wgt = 1;
      else if (s.status === "mastered") wgt = 0.35;
      if (s.streak === 1) wgt *= 0.65;
      else if (s.streak === 2) wgt *= 0.4;
      else if (s.streak >= 3) wgt *= 0.2;
      if (x === current && list.length > 1) wgt = 0;
      return wgt;
    });
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < list.length; i++) {
      r -= weights[i];
      if (r <= 0) return list[i];
    }
    return list[list.length - 1];
  }

  function updateStats() {
    let mastered = 0;
    state.forEach((s) => {
      if (s.status === "mastered") mastered++;
    });
    ui.stats.textContent = t("a_stats")
      .replace("{0}", today)
      .replace("{1}", mastered)
      .replace("{2}", correct);
  }

  function updateClock() {
    if (!clockOn) ui.secs.textContent = "∞";
    else if (counting) ui.secs.textContent = Math.ceil(timeLeft) + " s";
    else ui.secs.textContent = duration + " s";
    ui.bar.style.width = clockOn ? Math.max(0, (timeLeft / duration) * 100) + "%" : "100%";
    ui.barWrap.hidden = !clockOn;
    ui.clock.textContent = clockOn ? t("a_on") : t("a_off");
    ui.clock.style.background = clockOn ? "var(--azul)" : "var(--boton)";
  }

  function markSeen() {
    const s = info(current);
    if (!s.seen) {
      s.seen = true;
      today++;
    }
  }

  function load() {
    ui.panel.hidden = true;
    ui.yn.classList.remove("off");
    timeUp = false;
    forgetPending = false;
    ui.where.textContent = t("a_practicing") + names()[folderIndex];
    current = pick(folders()[names()[folderIndex]]);
    ui.word.textContent = current.w;
    ui.pron.textContent = current.p ? "[" + current.p + "]" : "";
    timeLeft = duration;
    counting = true;
    last = performance.now();
    updateClock();
  }

  function fillAnswer(word) {
    ui.ptext.replaceChildren();
    const add = (tag, cls, text) => {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      e.textContent = text;
      ui.ptext.appendChild(e);
    };
    add("b", "", word.w);
    add("span", "", word.m);
    if (word.p) add("span", "g", "[" + word.p + "]");
    if (word.n) add("span", "g", word.n);
  }

  function forget() {
    const s = info(current);
    s.status = "forgotten";
    s.streak = 0;
    s.forgot++;
    markSeen();
    updateStats();
  }

  function showPanel(title, withVer) {
    ui.yn.classList.add("off");
    ui.panel.hidden = false;
    ui.ptitle.textContent = title;
    ui.ver.hidden = !withVer;
  }

  function tick(now) {
    if (counting && clockOn && !timeUp) {
      timeLeft -= (now - last) / 1000;
      if (timeLeft <= 0) {
        timeLeft = 0;
        counting = false;
        timeUp = true;
        forgetPending = true;
        ui.ptext.replaceChildren();
        const q = document.createElement("span");
        q.className = "q";
        q.textContent = t("a_want");
        ui.ptext.appendChild(q);
        showPanel(t("a_timeup"), true);
      }
      updateClock();
    }
    last = now;
    requestAnimationFrame(tick);
  }

  ui.si.addEventListener("click", () => {
    if (timeUp) return;
    const s = info(current);
    s.streak++;
    correct++;
    s.status = s.streak >= 3 ? "mastered" : "known";
    markSeen();
    updateStats();
    load();
  });

  ui.no.addEventListener("click", () => {
    if (timeUp) return;
    forget();
    counting = false;
    timeUp = true;
    forgetPending = false;
    fillAnswer(current);
    showPanel(t("a_review"), false);
  });

  ui.ver.addEventListener("click", () => {
    fillAnswer(current);
    ui.ver.hidden = true;
  });

  ui.cont.addEventListener("click", () => {
    if (forgetPending) forget();
    load();
  });

  ui.minus.addEventListener("click", () => {
    duration = Math.max(5, duration - 5);
    if (counting && clockOn) timeLeft = duration;
    updateClock();
  });

  ui.plus.addEventListener("click", () => {
    duration = Math.min(120, duration + 5);
    if (counting && clockOn) timeLeft = duration;
    updateClock();
  });

  ui.clock.addEventListener("click", () => {
    clockOn = !clockOn;
    if (!timeUp) {
      timeLeft = duration;
      counting = true;
    }
    updateClock();
  });

  ui.change.addEventListener("click", () => {
    folderIndex = (folderIndex + 1) % names().length;
    load();
  });

  requestAnimationFrame(tick);

  return {
    reset() {
      state = new Map();
      folderIndex = 0;
      current = null;
      today = 0;
      correct = 0;
      updateStats();
      load();
    },
  };
})();

document
  .querySelectorAll(".lang button")
  .forEach((b) => b.addEventListener("click", () => applyLang(b.dataset.lang)));

let start = "en";
try {
  const saved = localStorage.getItem("cw-lang");
  if (saved === "en" || saved === "es") start = saved;
  else if ((navigator.language || "").toLowerCase().startsWith("es")) start = "es";
} catch (e) {
  if ((navigator.language || "").toLowerCase().startsWith("es")) start = "es";
}
applyLang(start);
