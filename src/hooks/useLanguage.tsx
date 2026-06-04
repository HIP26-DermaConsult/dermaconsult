import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Language = "de" | "en";

interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
  t: (de: string, en: string) => string;
}

const STORAGE_KEY = "derma_consult_language";
const LanguageContext = createContext<LanguageContextValue | null>(null);
const originalText = new WeakMap<Text, string>();

const UI_TRANSLATIONS: Record<string, string> = {
  Dashboard: "Dashboard",
  "Neues Konsil": "New consultation",
  Konsile: "Consultations",
  Patienten: "Patients",
  Anfragen: "Requests",
  Verlauf: "Activity",
  Einstellungen: "Settings",
  Hilfe: "Help",
  Abmelden: "Log out",
  Anmelden: "Log in",
  "Demo-Zugang": "Demo access",
  "Als Hausarzt:in": "As general practitioner",
  "Als Dermatolog:in": "As dermatologist",
  "Als Patient:in": "As patient",
  Willkommen: "Welcome",
  "Meine Behandlung": "My treatment",
  "Meine Behandlungen": "My treatments",
  "Noch keine Freigaben": "No shared summaries yet",
  "Daten hochladen": "Upload data",
  "Ihre Praxis bittet um zusaetzliche Daten": "Your practice is requesting additional data",
  "Bilder zum Konsil hochladen": "Upload images to consultation",
  "Fotos aufnehmen oder auswaehlen": "Take or choose photos",
  "Bilder auswaehlen": "Choose images",
  "Ausgewaehlte Bilder": "Selected images",
  "Kommentar (optional)": "Comment (optional)",
  "Zum Konsil hinzufuegen": "Add to consultation",
  "Upload nicht moeglich": "Upload not possible",
  "Vielen Dank!": "Thank you!",
  "Zur Anmeldung": "Go to login",
  Hausarzt: "General practitioner",
  "Hausarzt:in": "General practitioner",
  "Patient:in": "Patient",
  Hochgeladen: "Uploaded",
  Neu: "New",
  Geprueft: "Reviewed",
  Ziel: "Target",
  Bilddokumentation: "Image documentation",
  "Betroffene Koerperregionen": "Affected body regions",
  Status: "Status",
  Kommunikation: "Communication",
  Patientenfreigabe: "Patient sharing",
  "Fuer Patient:in freigeben": "Share with patient",
  "Freigabe bearbeiten": "Edit sharing",
  "Daten anfordern": "Request data",
  "Konsil schliessen": "Close consultation",
  "Befund (PDF)": "Report (PDF)",
  Fragestellung: "Question",
  Symptomdauer: "Symptom duration",
  Verdachtsdiagnose: "Suspected diagnosis",
  "Bisherige Therapie": "Previous treatment",
  "Anamnese / Befund": "History / findings",
  "Weitere Hinweise": "Additional notes",
  "Bild entfernen": "Remove image",
  "Sprache wechseln": "Switch language",
  Benachrichtigungen: "Notifications",
  "Konsile, Patienten suchen...": "Search consultations, patients...",
  ID: "ID",
  Patient: "Patient",
  Erstellt: "Created",
  Aktualisiert: "Updated",
  Dringlichkeit: "Urgency",
  "Patient auswaehlen": "Select patient",
  Anamnese: "History",
  Koerperregionen: "Body regions",
  Bilder: "Images",
  Uebersicht: "Overview",
  "Pruefen & senden": "Review & send",
  Entwurf: "Draft",
  Eingereicht: "Submitted",
  "In Bearbeitung": "In review",
  Rueckfrage: "Follow-up question",
  Beantwortet: "Answered",
  Abgeschlossen: "Closed",
  Routine: "Routine",
  Zeitnah: "Soon",
  Dringend: "Urgent",
  "Kopf / Gesicht": "Head / face",
  Hals: "Neck",
  Brust: "Chest",
  Bauch: "Abdomen",
  Ruecken: "Back",
  "Arm links": "Left arm",
  "Arm rechts": "Right arm",
  "Hand links": "Left hand",
  "Hand rechts": "Right hand",
  "Bein links": "Left leg",
  "Bein rechts": "Right leg",
  "Fuss links": "Left foot",
  "Fuss rechts": "Right foot",
  "Keine Bilder vorhanden": "No images available",
  "Angehaengte Bilder": "Attached images",
  "Dateien auswaehlen": "Choose files",
  "QR-Code anzeigen": "Show QR code",
  Senden: "Send",
  Schliessen: "Close",
  Abbrechen: "Cancel",
  Speichern: "Save",
  Zurueck: "Back",
  Weiter: "Next",
  "Konsil absenden": "Submit consultation",
  "Neues Konsil erstellen": "Create new consultation",
  "Neue:r Patient:in": "New patient",
  Checkliste: "Checklist",
  "Patient ausgewaehlt": "Patient selected",
  "Klinische Angaben vollstaendig": "Clinical details complete",
  "Koerperregionen markiert": "Body regions marked",
  "Mindestens ein Bild empfohlen": "At least one image recommended",
  optional: "optional",
  "Befund der Dermatologie": "Dermatology report",
  Einschaetzung: "Assessment",
  "Empfohlene Diagnose": "Recommended diagnosis",
  Differentialdiagnosen: "Differential diagnoses",
  Therapieempfehlung: "Treatment recommendation",
  "Naechste Schritte": "Next steps",
  "In-Person-Termin empfohlen": "In-person appointment recommended",
  Dringlichkeitsempfehlung: "Urgency recommendation",
  Ja: "Yes",
  Nein: "No",
  "Interne Notizen": "Internal notes",
  "Nur fuer Sie sichtbar": "Only visible to you",
  "Befund / Einschaetzung": "Report / assessment",
  "Strukturierte Beurteilung und Therapieempfehlung": "Structured assessment and treatment recommendation",
  "Begutachtung starten": "Start review",
  "Befund senden": "Send report",
  "Entwurf speichern": "Save draft",
  "Eingehende Konsile": "Incoming consultations",
  "Rezidivierendes Handekzem, V. a. Kontaktekzem": "Recurrent hand eczema, suspected contact eczema",
  "Akne tarda, therapieresistent": "Adult acne, treatment-resistant",
  "Schuppende Plaques an Ellenbogen und Knien": "Scaly plaques on elbows and knees",
  "Verdacht auf Onychomykose": "Suspected onychomycosis",
  Kontaktekzem: "Contact eczema",
  "V. a. Plattenepithelkarzinom": "Suspected squamous cell carcinoma",
  "Acne tarda": "Adult acne",
  "Psoriasis vulgaris": "Psoriasis vulgaris",
  Onychomykose: "Onychomycosis",
  "6 Wochen": "6 weeks",
  "3 Wochen": "3 weeks",
  "8 Monate": "8 months",
  "5 Tage": "5 days",
  "ca. 4 Monate": "approx. 4 months",
  "6 Monate": "6 months",
  Keine: "None",
};

function translateText(text: string, language: Language) {
  if (language === "de") return text;
  if (UI_TRANSLATIONS[text]) return UI_TRANSLATIONS[text];
  if (text.startsWith("geb. ")) return text.replace("geb.", "born");
  if (text.startsWith("Erstellt am ")) return text.replace("Erstellt am", "Created on");
  if (text.startsWith("Eingegangen ")) return text.replace("Eingegangen", "Received");
  if (text.startsWith("Freigegeben von ")) return text.replace("Freigegeben von", "Shared by");
  if (text.startsWith("Hochgeladen ")) return text.replace("Hochgeladen", "Uploaded");
  if (text.includes(" Bild(er)")) return text.replace(" Bild(er)", " image(s)");
  if (text.includes(" Datei(en)")) return text.replace(" Datei(en)", " file(s)");
  return text;
}

function preserveWhitespace(original: string, translated: string) {
  const prefix = original.match(/^\s*/)?.[0] || "";
  const suffix = original.match(/\s*$/)?.[0] || "";
  return `${prefix}${translated}${suffix}`;
}

function translateDom(language: Language) {
  if (typeof document === "undefined") return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  nodes.forEach((node) => {
    const original = originalText.get(node) || node.nodeValue || "";
    originalText.set(node, original);
    const next = language === "en" ? preserveWhitespace(original, translateText(original.trim(), language)) : original;
    if (node.nodeValue !== next) node.nodeValue = next;
  });

  document.querySelectorAll<HTMLElement>("[placeholder],[title],[aria-label]").forEach((element) => {
    ["placeholder", "title", "aria-label"].forEach((attr) => {
      const current = element.getAttribute(attr);
      if (!current) return;
      const dataAttr = `data-original-${attr}`;
      const original = element.getAttribute(dataAttr) || current;
      element.setAttribute(dataAttr, original);
      element.setAttribute(attr, language === "en" ? translateText(original, language) : original);
    });
  });
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "de";
    } catch {
      return "de";
    }
  });

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(STORAGE_KEY, language);
    window.setTimeout(() => translateDom(language), 0);
    const observer = new MutationObserver(() => translateDom(language));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => (current === "de" ? "en" : "de"));
  }, []);

  const t = useCallback((de: string, en: string) => (language === "en" ? en : de), [language]);

  const value = useMemo(() => ({ language, toggleLanguage, t }), [language, toggleLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
