const APROBADAS = ["PURCHASE_APPROVED", "PURCHASE_COMPLETE", "APPROVED", "COMPLETE", "COMPLETED"];
const ANULADAS = [
  "PURCHASE_REFUNDED",
  "PURCHASE_CHARGEBACK",
  "PURCHASE_PROTEST",
  "PURCHASE_CANCELED",
  "REFUNDED",
  "CHARGEBACK",
  "DISPUTE",
  "CANCELED",
  "CANCELLED",
];

function iguales(a, b) {
  const x = new TextEncoder().encode(String(a || ""));
  const y = new TextEncoder().encode(String(b || ""));
  if (x.length === 0 || x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}

function responder(estado, texto) {
  return new Response(texto, { status: estado, headers: { "cache-control": "no-store" } });
}

async function leerCuerpo(request) {
  const tipo = request.headers.get("content-type") || "";
  if (tipo.includes("application/json")) return await request.json();
  const datos = await request.formData();
  const plano = {};
  for (const [k, v] of datos.entries()) plano[k] = v;
  return plano;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.COMPRAS || !env.HOTMART_HOTTOK) return responder(503, "no configurado");

  let cuerpo;
  try {
    cuerpo = await leerCuerpo(request);
  } catch (e) {
    return responder(400, "datos");
  }

  const token = request.headers.get("x-hotmart-hottok") || cuerpo.hottok;
  if (!iguales(token, env.HOTMART_HOTTOK)) return responder(401, "token");

  const datos = cuerpo.data || {};
  const evento = String(cuerpo.event || "").toUpperCase();
  const estadoCompra = String((datos.purchase && datos.purchase.status) || cuerpo.status || "").toUpperCase();
  const transaccion = String((datos.purchase && datos.purchase.transaction) || cuerpo.transaction || "")
    .toUpperCase()
    .replace(/\s+/g, "");
  const correo = String((datos.buyer && datos.buyer.email) || cuerpo.email || "")
    .trim()
    .toLowerCase();
  const producto = String((datos.product && datos.product.id) || cuerpo.prod || "");

  if (!transaccion || !correo) return responder(200, "ignorado");
  if (env.HOTMART_PRODUCTOS) {
    const permitidos = String(env.HOTMART_PRODUCTOS)
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (permitidos.length && !permitidos.includes(producto)) return responder(200, "otro producto");
  }

  let nuevoEstado = "";
  if (APROBADAS.includes(evento) || (!evento && APROBADAS.includes(estadoCompra))) nuevoEstado = "aprobada";
  if (ANULADAS.includes(evento) || ANULADAS.includes(estadoCompra)) nuevoEstado = "anulada";
  if (!nuevoEstado) return responder(200, "sin cambios");

  const clave = "compra:" + transaccion;
  const anterior = (await env.COMPRAS.get(clave, "json")) || {};
  if (anterior.estado === "anulada" && nuevoEstado === "aprobada") return responder(200, "ya anulada");

  const registro = {
    correo,
    estado: nuevoEstado,
    producto,
    nombre: String((datos.buyer && datos.buyer.name) || cuerpo.name || "").slice(0, 120),
    fecha: anterior.fecha || new Date().toISOString(),
    actualizada: new Date().toISOString(),
    celular: anterior.celular || null,
    activadaEn: anterior.activadaEn || null,
  };
  await env.COMPRAS.put(clave, JSON.stringify(registro));
  return responder(200, "ok");
}

export async function onRequest() {
  return responder(405, "metodo");
}
