const ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function normalizarCodigo(texto) {
  let r = "";
  for (const original of String(texto || "").toUpperCase()) {
    let c = original;
    if (c === "-" || c === " " || c === "\t" || c === "\r" || c === "\n") continue;
    if (c === "O") c = "0";
    if (c === "I" || c === "L") c = "1";
    if (!ALFABETO.includes(c)) return "";
    r += c;
  }
  return r;
}

function normalizarTransaccion(texto) {
  return String(texto || "")
    .toUpperCase()
    .replace(/\s+/g, "");
}

function normalizarCorreo(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase();
}

function conGuiones(s) {
  return s.match(/.{1,4}/g).join("-");
}

function hexABytes(hex) {
  const limpio = String(hex || "").trim();
  if (!/^[0-9a-fA-F]{64}$/.test(limpio)) return null;
  const b = new Uint8Array(32);
  for (let i = 0; i < 32; i++) b[i] = parseInt(limpio.substr(i * 2, 2), 16);
  return b;
}

async function activacionPara(llave, codigoCelular) {
  const clave = await crypto.subtle.importKey("raw", llave, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const firma = new Uint8Array(
    await crypto.subtle.sign("HMAC", clave, new TextEncoder().encode("CW-ACT-1|" + codigoCelular)),
  );
  let v = 0n;
  for (let i = 0; i < 8; i++) v = (v << 8n) | BigInt(firma[i]);
  v >>= 4n;
  let r = "";
  for (let i = 0; i < 12; i++) r += ALFABETO[Number((v >> BigInt(5 * (11 - i))) & 31n)];
  return r;
}

function responder(estado, datos) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.COMPRAS) return responder(503, { ok: false, error: "no_configurado", falta: "base_de_datos" });
  if (!env.LLAVE_ACTIVACION) return responder(503, { ok: false, error: "no_configurado", falta: "llave" });
  const llave = hexABytes(env.LLAVE_ACTIVACION);
  if (!llave) return responder(503, { ok: false, error: "no_configurado", falta: "llave_formato" });

  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch (e) {
    return responder(400, { ok: false, error: "datos" });
  }

  const correo = normalizarCorreo(cuerpo.correo);
  const transaccion = normalizarTransaccion(cuerpo.transaccion);
  const celular = normalizarCodigo(cuerpo.celular);

  if (celular.length !== 8) return responder(400, { ok: false, error: "celular" });
  if (!correo.includes("@") || correo.length > 200 || transaccion.length < 6 || transaccion.length > 40)
    return responder(400, { ok: false, error: "datos" });

  const clave = "compra:" + transaccion;
  const guardada = await env.COMPRAS.get(clave, "json");
  if (!guardada || guardada.correo !== correo) return responder(404, { ok: false, error: "no_encontrada" });
  if (guardada.estado !== "aprobada") return responder(403, { ok: false, error: "anulada" });

  if (guardada.celular && guardada.celular !== celular)
    return responder(409, { ok: false, error: "otro_celular" });

  const codigo = await activacionPara(llave, celular);

  if (!guardada.celular) {
    guardada.celular = celular;
    guardada.activadaEn = new Date().toISOString();
    await env.COMPRAS.put(clave, JSON.stringify(guardada));
  }

  return responder(200, { ok: true, codigo: conGuiones(codigo) });
}

export async function onRequest() {
  return responder(405, { ok: false, error: "metodo" });
}
