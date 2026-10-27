const APK_URL = "";

const TA = {
  en: {
    back: "← Back to home",
    kicker: "Course + App",
    title: "Activate your app",
    intro:
      "The ChavaleteWords app that comes with the course is activated once on your phone. It takes about two minutes.",
    s1_t: "Install the app",
    s1_p: "Download the app file (APK) and open it on your Android phone.",
    s1_btn: "Download the app",
    s1_help:
      "The download link is in your purchase email. Your phone will ask you to allow installing apps from your browser or file manager: allow it only for this installation.",
    s2_t: "Copy your phone code",
    s2_p: "Open the app. You'll see the code of your phone, like K7Q2-M9XD. Tap Copy.",
    s3_t: "Get your activation code",
    s3_p: "Fill in this form. Then paste the activation code in the app and tap Activate.",
    f_email: "Email you used to buy",
    f_tx: "Transaction code",
    f_tx_help: "It's in your Hotmart purchase email and starts with HP.",
    f_phone: "Code of this phone",
    f_phone_help: "It appears in the app when you open it.",
    f_send: "Get my activation code",
    sending: "Checking your purchase…",
    r_title: "Your activation code",
    r_copy: "Copy",
    r_copied: "Copied",
    r_note: "Paste it in the app and tap Activate. It only works on this phone. Keep your purchase email in case you reinstall the app.",
    e_celular: "The phone code must have 8 characters, like K7Q2-M9XD. Copy it from the app.",
    e_datos: "Check your email and transaction code.",
    e_no_encontrada:
      "We couldn't find a purchase with that email and transaction code. If you just paid, wait a minute and try again.",
    e_anulada: "This purchase was refunded or canceled, so it can't be activated.",
    e_otro_celular:
      "This purchase was already activated on another phone. If you changed phones, write to chavaleteworld@gmail.com with your transaction code.",
    e_otro: "Something went wrong. Try again in a few minutes or write to chavaleteworld@gmail.com.",
    faq_t: "Questions",
    q1: "I uninstalled the app. Do I need a new code?",
    a1: "No. On the same phone, your code still works. You can also get it again here with the same details.",
    q2: "I changed phones",
    a2: "Each purchase works on one phone. Write to chavaleteworld@gmail.com with your transaction code and we'll help you.",
    q3: "Does the app need internet to activate?",
    a3: "No. The app never connects to the internet. You only use this page to get your code.",
    q4: "My phone says the app may be harmful",
    a4: "Android shows this warning for every app installed outside Google Play. Download the app only from this website or from your purchase email.",
    privacy: "Privacy policy",
    page_title: "Activate the app | ChavaleteWorld",
  },
  es: {
    back: "← Volver al inicio",
    kicker: "Curso + App",
    title: "Activa tu app",
    intro:
      "La app ChavaleteWords que viene con el curso se activa una sola vez en tu celular. Toma unos dos minutos.",
    s1_t: "Instala la app",
    s1_p: "Descarga el archivo de la app (APK) y ábrelo en tu celular Android.",
    s1_btn: "Descargar la app",
    s1_help:
      "El enlace de descarga está en el correo de tu compra. Tu celular te pedirá permitir instalar apps desde el navegador o el administrador de archivos: permítelo solo para esta instalación.",
    s2_t: "Copia el código de tu celular",
    s2_p: "Abre la app. Verás el código de tu celular, por ejemplo K7Q2-M9XD. Toca Copiar.",
    s3_t: "Recibe tu código de activación",
    s3_p: "Llena este formulario. Luego pega el código de activación en la app y toca Activar.",
    f_email: "Correo con el que compraste",
    f_tx: "Código de la transacción",
    f_tx_help: "Está en el correo de compra de Hotmart y empieza por HP.",
    f_phone: "Código de este celular",
    f_phone_help: "Aparece en la app al abrirla.",
    f_send: "Recibir mi código de activación",
    sending: "Revisando tu compra…",
    r_title: "Tu código de activación",
    r_copy: "Copiar",
    r_copied: "Copiado",
    r_note: "Pégalo en la app y toca Activar. Solo sirve en este celular. Guarda el correo de tu compra por si reinstalas la app.",
    e_celular: "El código del celular tiene 8 caracteres, por ejemplo K7Q2-M9XD. Cópialo de la app.",
    e_datos: "Revisa tu correo y el código de la transacción.",
    e_no_encontrada:
      "No encontramos una compra con ese correo y ese código de transacción. Si acabas de pagar, espera un minuto e inténtalo de nuevo.",
    e_anulada: "Esta compra fue reembolsada o cancelada, por eso no se puede activar.",
    e_otro_celular:
      "Esta compra ya se activó en otro celular. Si cambiaste de celular, escribe a chavaleteworld@gmail.com con tu código de transacción.",
    e_otro: "Algo salió mal. Inténtalo en unos minutos o escribe a chavaleteworld@gmail.com.",
    faq_t: "Preguntas",
    q1: "Desinstalé la app. ¿Necesito otro código?",
    a1: "No. En el mismo celular tu código sigue sirviendo. También lo puedes volver a pedir aquí con los mismos datos.",
    q2: "Cambié de celular",
    a2: "Cada compra sirve en un celular. Escribe a chavaleteworld@gmail.com con tu código de transacción y te ayudamos.",
    q3: "¿La app necesita internet para activarse?",
    a3: "No. La app nunca se conecta a internet. Esta página solo la usas para recibir tu código.",
    q4: "Mi celular dice que la app podría ser dañina",
    a4: "Android muestra ese aviso con toda app que se instala por fuera de Google Play. Descarga la app solo desde esta página o desde el correo de tu compra.",
    privacy: "Política de privacidad",
    page_title: "Activa la app | ChavaleteWorld",
  },
};

let lang = "en";
const ta = (k) => TA[lang][k];
const $ = (id) => document.getElementById(id);
let ultimoError = "";

function applyLang(next) {
  lang = next;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-t]").forEach((e) => {
    e.textContent = ta(e.dataset.t);
  });
  document
    .querySelectorAll(".lang button")
    .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  document.title = ta("page_title");
  if (ultimoError) mostrarError(ultimoError);
  try {
    localStorage.setItem("cw-lang", lang);
  } catch (e) {}
}

function mostrarError(clave) {
  ultimoError = clave;
  $("msg").textContent = ta(clave) || ta("e_otro");
  $("msg").hidden = false;
}

function normalizarCelular(texto) {
  return String(texto || "")
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
}

$("form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  ultimoError = "";
  $("msg").hidden = true;
  $("resultado").hidden = true;

  const celular = normalizarCelular($("celular").value);
  if (!/^[0-9A-HJKMNP-TV-Z]{8}$/.test(celular)) return mostrarError("e_celular");
  if (!$("correo").value.includes("@") || $("transaccion").value.trim().length < 6) return mostrarError("e_datos");

  const boton = $("enviar");
  boton.disabled = true;
  boton.textContent = ta("sending");
  try {
    const res = await fetch("api/activar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        correo: $("correo").value,
        transaccion: $("transaccion").value,
        celular,
      }),
    });
    const datos = await res.json().catch(() => ({}));
    if (res.ok && datos.ok) {
      $("codigo").textContent = datos.codigo;
      $("copiar").textContent = ta("r_copy");
      $("resultado").hidden = false;
      $("resultado").scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      mostrarError("e_" + (datos.error || "otro"));
    }
  } catch (e) {
    mostrarError("e_otro");
  } finally {
    boton.disabled = false;
    boton.textContent = ta("f_send");
  }
});

$("copiar").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("codigo").textContent);
    $("copiar").textContent = ta("r_copied");
  } catch (e) {}
});

if (APK_URL) {
  $("apk").href = APK_URL;
  $("apk").hidden = false;
}

document
  .querySelectorAll(".lang button")
  .forEach((b) => b.addEventListener("click", () => applyLang(b.dataset.lang)));

const params = new URLSearchParams(location.search);
const desdeApp = normalizarCelular(params.get("c"));
if (/^[0-9A-HJKMNP-TV-Z]{8}$/.test(desdeApp)) $("celular").value = desdeApp.slice(0, 4) + "-" + desdeApp.slice(4);

let start = "en";
try {
  const saved = localStorage.getItem("cw-lang");
  if (params.get("lang") === "es" || params.get("lang") === "en") start = params.get("lang");
  else if (saved === "en" || saved === "es") start = saved;
  else if ((navigator.language || "").toLowerCase().startsWith("es")) start = "es";
} catch (e) {
  if ((navigator.language || "").toLowerCase().startsWith("es")) start = "es";
}
applyLang(start);
