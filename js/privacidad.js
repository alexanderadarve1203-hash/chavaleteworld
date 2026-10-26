function applyLang(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-lang-only]").forEach((e) => {
    e.hidden = e.dataset.langOnly !== lang;
  });
  document
    .querySelectorAll(".lang button")
    .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  document.title =
    lang === "es" ? "Política de privacidad | ChavaleteWorld" : "Privacy policy | ChavaleteWorld";
  try {
    localStorage.setItem("cw-lang", lang);
  } catch (e) {}
}

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
