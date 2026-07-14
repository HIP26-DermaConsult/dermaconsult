import Anthropic from "@anthropic-ai/sdk";

export const AI_ASSESSMENT_MODEL = "claude-opus-4-8";

export const AI_ASSESSMENT_SYSTEM_PROMPT = `Du bist ein klinisches Assistenzsystem fuer Dermatologie-Telekonsile. Du unterstuetzt Hausaerzt:innen und Dermatolog:innen, indem du basierend auf den bereitgestellten Patienten- und Konsildaten (Anamnese, Symptomdauer, betroffene Koerperregionen, Vorbehandlungen, ggf. klinische Fotos) eine strukturierte Einschaetzung gibst.

Antworte auf Deutsch in Markdown mit genau diesen Abschnitten:
## Differentialdiagnosen
## Wahrscheinlichste Diagnose
## Therapieempfehlung
## Empfohlene naechste Schritte
## Dringlichkeitseinschaetzung

Sei praezise und klinisch fundiert. Wenn Informationen fehlen (z. B. keine auswertbaren Bilder), weise explizit auf diese Einschraenkung hin, statt sie zu ignorieren. Beende deine Antwort immer mit:

**Hinweis:** Diese Einschaetzung wurde KI-generiert, ersetzt keine aerztliche Beurteilung und dient ausschliesslich zur Unterstuetzung der klinischen Entscheidungsfindung.`;

function computeAge(dateOfBirth) {
  if (!dateOfBirth) return undefined;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return undefined;
  const ageMs = Date.now() - dob.getTime();
  return Math.floor(ageMs / (365.25 * 24 * 3600 * 1000));
}

// Only Vercel Blob URLs (production mobile-upload path) are publicly
// fetchable by Anthropic's servers; local-dev relative paths and desktop
// picker/demo images have no server-reachable URL and are skipped.
function fetchableImageUrls(konsil) {
  return (konsil?.images || [])
    .map((image) => image.url)
    .filter((url) => typeof url === "string" && /^https:\/\//.test(url));
}

export function buildAiAssessmentRequest(konsil, patient) {
  const age = computeAge(patient?.dateOfBirth);
  const lines = [];

  lines.push(
    `Patient: ${age !== undefined ? `${age} Jahre` : "Alter unbekannt"}, ${patient?.gender || "Geschlecht unbekannt"}.`
  );
  if (patient?.allergies?.length) lines.push(`Allergien: ${patient.allergies.join(", ")}.`);
  if (patient?.medications?.length) lines.push(`Aktuelle Medikation: ${patient.medications.join(", ")}.`);
  if (patient?.diagnoses?.length) lines.push(`Vorbekannte Diagnosen: ${patient.diagnoses.join(", ")}.`);
  if (patient?.skinHistory?.length) lines.push(`Dermatologische Vorgeschichte: ${patient.skinHistory.join(", ")}.`);

  lines.push("");
  lines.push(`Grund des Konsils: ${konsil.reason}`);
  lines.push(`Klinische Beschreibung: ${konsil.clinicalDescription}`);
  lines.push(`Symptomdauer: ${konsil.symptomDuration}`);
  if (konsil.suspectedDiagnosis) lines.push(`Verdachtsdiagnose (Hausarzt): ${konsil.suspectedDiagnosis}`);
  if (konsil.previousTreatments) lines.push(`Bisherige Behandlungen: ${konsil.previousTreatments}`);
  if (konsil.additionalInfo) lines.push(`Zusatzinformationen: ${konsil.additionalInfo}`);
  if (konsil.selectedBodyRegions?.length) {
    lines.push(`Betroffene Koerperregionen: ${konsil.selectedBodyRegions.join(", ")}`);
  }

  const imageUrls = fetchableImageUrls(konsil);
  lines.push("");
  lines.push(
    imageUrls.length
      ? `${imageUrls.length} klinische(s) Bild(er) sind unten angehaengt.`
      : "Keine auswertbaren Bilder vorhanden - die Einschaetzung basiert ausschliesslich auf den Textangaben."
  );

  const content = [{ type: "text", text: lines.join("\n") }];
  for (const url of imageUrls) {
    content.push({ type: "image", source: { type: "url", url } });
  }
  return content;
}

export async function generateAiAssessment(konsil, patient) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY ist nicht konfiguriert.");
  }
  if (!konsil) {
    throw new Error("Konsildaten fehlen.");
  }

  const client = new Anthropic({ apiKey });
  const content = buildAiAssessmentRequest(konsil, patient);

  const response = await client.messages.create({
    model: AI_ASSESSMENT_MODEL,
    max_tokens: 4096,
    system: AI_ASSESSMENT_SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  return {
    content: text,
    model: AI_ASSESSMENT_MODEL,
    generatedAt: new Date().toISOString(),
  };
}
