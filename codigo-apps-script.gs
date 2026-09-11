/**
 * CRAC — Backend en Google Sheets
 *
 * Hace dos cosas:
 *  1. doPost: guarda los envíos del formulario web en la hoja "Contactos"
 *     y avisa por correo al centro.
 *  2. doGet?config=1: devuelve la configuración de la pestaña "Padrinos",
 *     que es el PANEL DE CONTROL de la sección de apadrinamiento:
 *     ahí se editan animales, fotos, montos y el comportamiento del
 *     botón (PayPal o WhatsApp) sin tocar el código de la página.
 *
 * Cómo desplegarlo: ver INSTRUCCIONES.md (parte A).
 * Tras pegar este código, ejecutá una vez la función crearHojaPadrinos
 * desde el editor (botón ▶) para que se cree la pestaña con ejemplos.
 */

const SHEET_CONTACTOS = "Contactos";
const SHEET_PADRINOS = "Padrinos";
const NOTIFY_EMAIL = "johanrayoal7@gmail.com"; // PRUEBAS — al pasar a producción: "volunteering@costaricaanimalrescuecenter.org" (o "" para no enviar aviso)

const ETIQUETAS_INTERES = {
  visitar: "Quiero visitar",
  voluntario: "Quiero ser voluntario",
  donar: "Quiero donar"
};

/* ============ 1) FORMULARIO → CONTACTOS ============ */

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_CONTACTOS);
    if (!sheet) sheet = ss.insertSheet(SHEET_CONTACTOS);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha", "Nombre", "Email", "WhatsApp", "Interés",
        "Personas", "Dieta", "Alergias", "Idioma", "Página"
      ]);
      sheet.setFrozenRows(1);
    }

    const d = JSON.parse(e.postData.contents);
    const interes = ETIQUETAS_INTERES[d.interes] || d.interes || "";

    sheet.appendRow([
      new Date(),
      d.nombre || "", d.email || "", d.whatsapp || "",
      interes, d.personas || "", d.dieta || "", d.alergias || "",
      d.idioma || "", d.pagina || ""
    ]);

    if (NOTIFY_EMAIL) {
      const cuerpo =
        "Nuevo contacto desde la web:\n\n" +
        "Nombre: " + (d.nombre || "-") + "\n" +
        "Email: " + (d.email || "-") + "\n" +
        "WhatsApp: " + (d.whatsapp || "-") + "\n" +
        "Interés: " + interes + "\n" +
        "Personas: " + (d.personas || "-") + "\n" +
        "Dieta: " + (d.dieta || "-") + "\n" +
        "Alergias: " + (d.alergias || "-") + "\n\n" +
        "Registrado en la hoja de cálculo: " + ss.getUrl();
      MailApp.sendEmail(NOTIFY_EMAIL, "Nuevo contacto desde la web CRARC", cuerpo);
    }

    return respuestaJson({ ok: true });
  } catch (err) {
    return respuestaJson({ ok: false, error: String(err) });
  }
}

/* ============ 2) CONFIGURACIÓN DE PADRINOS ============ */

function doGet(e) {
  if (e && e.parameter && e.parameter.config === "1") {
    return obtenerPadrinos();
  }
  return respuestaJson({ ok: true, servicio: "CRAC formulario + padrinos" });
}

function obtenerPadrinos() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_PADRINOS);
    if (!sheet) return respuestaJson({ ok: false, error: "No existe la hoja Padrinos. Ejecutá crearHojaPadrinos." });

    const filas = sheet.getDataRange().getValues();
    const padrinos = [];
    for (let i = 1; i < filas.length; i++) {
      const [id, nombre, especie, historia, foto, montos, boton, paypal, activo] = filas[i];
      if (!id) continue;
      // Activo: cualquier cosa que empiece con N (no, NO, n) oculta el animal
      if (String(activo).trim().toUpperCase().startsWith("N")) continue;
      padrinos.push({
        id: String(id).trim(),
        nombre: String(nombre || "").trim(),
        especie: String(especie || "").trim(),
        historia: String(historia || "").trim(),
        foto: String(foto || "").trim(),
        montos: String(montos || "")
          .split(",")
          .map(function (n) { return parseInt(n, 10); })
          .filter(function (n) { return n > 0; }),
        boton: String(boton || "whatsapp").trim().toLowerCase(),
        paypal: String(paypal || "").trim()
      });
    }
    return respuestaJson({ ok: true, padrinos: padrinos });
  } catch (err) {
    return respuestaJson({ ok: false, error: String(err) });
  }
}

/**
 * EJECUTAR UNA VEZ desde el editor (elegir esta función y botón ▶).
 * Crea la pestaña "Padrinos" con los 3 animales de ejemplo.
 */
function crearHojaPadrinos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getSheetByName(SHEET_PADRINOS)) {
    throw new Error("La hoja Padrinos ya existe. Borrala primero si querés recrearla.");
  }
  const sheet = ss.insertSheet(SHEET_PADRINOS);
  sheet.getRange(1, 1, 8, 9).setValues([
    ["ID", "Nombre", "Especie", "Historia", "Foto (URL)", "Montos ($, separados por coma)", "Boton (whatsapp o paypal)", "PayPal (usuario paypal.me o enlace completo)", "Activo (SI/NO)"],
    ["a1", "Grumpy", "", "", "", "10,25,50", "whatsapp", "", "SI"],
    ["a2", "Sharleen", "", "", "", "10,25,50", "whatsapp", "", "SI"],
    ["a3", "Lola", "", "", "", "10,25,50", "whatsapp", "", "SI"],
    ["a4", "Gandy", "", "", "", "10,25,50", "whatsapp", "", "SI"],
    ["a5", "Daniel", "", "", "", "10,25,50", "whatsapp", "", "SI"],
    ["a6", "Bamboo", "", "", "", "10,25,50", "whatsapp", "", "SI"]
  ]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, 9).setFontWeight("bold");
  sheet.setColumnWidths(1, 9, 160);
  sheet.getRange("A7").setValue(
    "Notas: a1 a a6 usan las descripciones traducidas y las fotos de la página (dejá Especie, Historia y Foto vacías). " +
    "Para un animal nuevo usá otro ID (ej: a7) y llenó Especie e Historia (se mostrarán igual en todos los idiomas). " +
    "Boton: 'paypal' abre PayPal con el monto elegido; 'whatsapp' abre el chat. " +
    "PayPal acepta el usuario de paypal.me (ej: crarccr) o un enlace completo de donación/suscripción. " +
    "Activo en NO oculta el animal sin borrar la fila. Los cambios se ven al recargar la página."
  );
}

/* ============ util ============ */

function respuestaJson(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
