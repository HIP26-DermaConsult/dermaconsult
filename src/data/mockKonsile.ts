import type { Konsil } from "@/types/konsil";

const now = new Date();
const d = (daysAgo: number, hour = 10) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(hour, 0, 0, 0);
  return dt.toISOString();
};

export const mockKonsile: Konsil[] = [
  {
    id: "K-2026-0001",
    patientId: "p_001",
    createdByUserId: "u_hausarzt_1",
    assignedExpertId: "u_derm_1",
    createdAt: d(8),
    updatedAt: d(3),
    status: "answered",
    urgency: "routine",
    reason: "Rezidivierendes Handekzem, V. a. Kontaktekzem",
    clinicalDescription:
      "Seit 6 Wochen rezidivierende erythemato-squamöse Plaques an Fingerseitenkanten und Handrücken. Juckreiz, gelegentlich Rhagaden.",
    symptomDuration: "6 Wochen",
    suspectedDiagnosis: "Kontaktekzem",
    previousTreatments: "Mometason 0,1% Creme 2x täglich für 10 Tage",
    additionalInfo: "Patientin arbeitet in der Gastronomie, häufiger Wasserkontakt.",
    selectedBodyRegions: ["hand-left", "hand-right"],
    images: [
      { id: "i1", filename: "hand_links_01.jpg", source: "desktop", uploadedAt: d(8), label: "Übersicht" },
      { id: "i2", filename: "hand_rechts_dermatoskopie.jpg", source: "mobile", uploadedAt: d(8), label: "Dermatoskopie" },
    ],
    messages: [
      {
        id: "m1",
        senderRole: "hausarzt",
        senderName: "Dr. Hofmann",
        createdAt: d(8),
        body: "Bitte um Einschätzung, ob topische Therapie ausreicht oder weiterführende Abklärung notwendig.",
      },
      {
        id: "m2",
        senderRole: "dermatologist",
        senderName: "Dr. Weber",
        createdAt: d(3),
        body: "Befund passt zu chronischem kumulativ-toxischem Handekzem. Siehe Befund.",
      },
    ],
    expertAssessment: {
      assessment:
        "Klinisches Bild eines chronisch kumulativ-toxischen Handekzems bei beruflicher Feuchtarbeit.",
      recommendedDiagnosis: "Chronisch kumulativ-toxisches Handekzem (L24.0)",
      differentialDiagnoses: ["Allergisches Kontaktekzem", "Dyshidrosiformes Ekzem"],
      recommendedTreatment:
        "Mometasonfuroat 0,1% Creme 1x tgl. für 2 Wochen, danach Tacrolimus 0,1% Salbe 2x tgl. Konsequente Hautpflege mit rückfettender Basistherapie.",
      nextSteps:
        "Epikutantest zur Abklärung Typ-IV-Allergien empfohlen. Hautschutz am Arbeitsplatz (Handschuhe, Baumwoll-Innenhandschuhe).",
      inPersonAppointmentRecommended: true,
      urgencyRecommendation: "soon",
      authoredAt: d(3),
      authoredBy: "Dr. Weber",
    },
    timeline: [
      { id: "t1", type: "created", at: d(8), by: "Dr. Hofmann", description: "Konsil erstellt" },
      { id: "t2", type: "submitted", at: d(8), by: "Dr. Hofmann", description: "An Dermatologie übermittelt" },
      { id: "t3", type: "in_review", at: d(7), by: "Dr. Weber", description: "Begutachtung gestartet" },
      { id: "t4", type: "answered", at: d(3), by: "Dr. Weber", description: "Befund übermittelt" },
    ],
  },
  {
    id: "K-2026-0002",
    patientId: "p_002",
    createdByUserId: "u_hausarzt_1",
    assignedExpertId: "u_derm_1",
    createdAt: d(2),
    updatedAt: d(1),
    status: "in_review",
    urgency: "urgent",
    reason: "Schnell wachsende, blutende Läsion an der Schläfe",
    clinicalDescription:
      "Seit 3 Wochen progredient wachsende, ulzerierende Läsion temporal rechts, ca. 8 mm. Patient mit V. a. NMSC.",
    symptomDuration: "3 Wochen",
    suspectedDiagnosis: "V. a. Plattenepithelkarzinom",
    previousTreatments: "Keine",
    selectedBodyRegions: ["head"],
    images: [
      { id: "i3", filename: "schläfe_übersicht.jpg", source: "desktop", uploadedAt: d(2), label: "Übersicht" },
      { id: "i4", filename: "schläfe_nähe.jpg", source: "desktop", uploadedAt: d(2), label: "Nähe" },
      { id: "i5", filename: "schläfe_derma.jpg", source: "mobile", uploadedAt: d(2), label: "Dermatoskopie" },
    ],
    messages: [
      {
        id: "m3",
        senderRole: "hausarzt",
        senderName: "Dr. Hofmann",
        createdAt: d(2),
        body: "Patient mit hoher UV-Belastung in der Vorgeschichte. Bitte zeitnahe Einschätzung.",
      },
    ],
    timeline: [
      { id: "t5", type: "created", at: d(2), by: "Dr. Hofmann", description: "Konsil erstellt" },
      { id: "t6", type: "submitted", at: d(2), by: "Dr. Hofmann", description: "An Dermatologie übermittelt" },
      { id: "t7", type: "in_review", at: d(1), by: "Dr. Weber", description: "Begutachtung gestartet" },
    ],
  },
  {
    id: "K-2026-0003",
    patientId: "p_003",
    createdByUserId: "u_hausarzt_1",
    assignedExpertId: "u_derm_1",
    createdAt: d(5),
    updatedAt: d(2),
    status: "rueckfrage",
    urgency: "soon",
    reason: "Akne tarda, therapieresistent",
    clinicalDescription:
      "Persistierende inflammatorische Akne im Wangen-/Kinnbereich seit 8 Monaten trotz topischer Therapie.",
    symptomDuration: "8 Monate",
    suspectedDiagnosis: "Acne tarda",
    previousTreatments:
      "Adapalen 0,1% / Benzoylperoxid 2,5% Gel 1x abends, Doxycyclin 100 mg über 12 Wochen",
    selectedBodyRegions: ["head", "neck"],
    images: [
      { id: "i6", filename: "gesicht_links.jpg", source: "mobile", uploadedAt: d(5) },
      { id: "i7", filename: "gesicht_rechts.jpg", source: "mobile", uploadedAt: d(5) },
    ],
    messages: [
      {
        id: "m4",
        senderRole: "hausarzt",
        senderName: "Dr. Hofmann",
        createdAt: d(5),
        body: "Bitte um Empfehlung zur weiteren Therapie. Isotretinoin denkbar?",
      },
      {
        id: "m5",
        senderRole: "dermatologist",
        senderName: "Dr. Weber",
        createdAt: d(2),
        body: "Bitte ergänzend Laborwerte (Leberwerte, Lipidstatus) sowie Information zu Schwangerschaftsverhütung mitteilen.",
      },
    ],
    timeline: [
      { id: "t8", type: "created", at: d(5), by: "Dr. Hofmann", description: "Konsil erstellt" },
      { id: "t9", type: "submitted", at: d(5), by: "Dr. Hofmann", description: "An Dermatologie übermittelt" },
      { id: "t10", type: "in_review", at: d(4), by: "Dr. Weber", description: "Begutachtung gestartet" },
      { id: "t11", type: "rueckfrage", at: d(2), by: "Dr. Weber", description: "Rückfrage an Hausarzt gesendet" },
    ],
  },
  {
    id: "K-2026-0004",
    patientId: "p_004",
    createdByUserId: "u_hausarzt_1",
    assignedExpertId: "u_derm_1",
    createdAt: d(12),
    updatedAt: d(10),
    status: "closed",
    urgency: "routine",
    reason: "Kontrolle multipler Nävi am Rücken",
    clinicalDescription:
      "Routinekontrolle bei multiplen Nävi am Rücken. Ein Nävus paravertebral links mit unscharfer Begrenzung.",
    symptomDuration: "Bekannt seit Jahren",
    selectedBodyRegions: ["back"],
    images: [
      { id: "i8", filename: "rücken_übersicht.jpg", source: "desktop", uploadedAt: d(12), label: "Übersicht" },
      { id: "i9", filename: "rücken_naevus.jpg", source: "desktop", uploadedAt: d(12), label: "Dermatoskopie" },
    ],
    messages: [
      {
        id: "m6",
        senderRole: "hausarzt",
        senderName: "Dr. Hofmann",
        createdAt: d(12),
        body: "Bitte um Einschätzung des markierten Nävus.",
      },
      {
        id: "m7",
        senderRole: "dermatologist",
        senderName: "Dr. Weber",
        createdAt: d(10),
        body: "Bild zeigt einen dysplastischen Nävus ohne akute Malignitätszeichen. Befund siehe Anhang.",
      },
    ],
    expertAssessment: {
      assessment:
        "Dysplastischer Nävus ohne akute Malignitätszeichen. Empfehlung zur regelmäßigen Verlaufskontrolle.",
      recommendedDiagnosis: "Atypischer melanozytärer Nävus (D22.5)",
      differentialDiagnoses: ["Melanoma in situ"],
      recommendedTreatment: "Beobachtung mit Verlaufskontrolle in 3 Monaten.",
      nextSteps: "Bei Größen-/Farbänderung Exzision empfohlen.",
      inPersonAppointmentRecommended: false,
      urgencyRecommendation: "routine",
      authoredAt: d(10),
      authoredBy: "Dr. Weber",
    },
    timeline: [
      { id: "t12", type: "created", at: d(12), by: "Dr. Hofmann", description: "Konsil erstellt" },
      { id: "t13", type: "submitted", at: d(12), by: "Dr. Hofmann", description: "An Dermatologie übermittelt" },
      { id: "t14", type: "answered", at: d(10), by: "Dr. Weber", description: "Befund übermittelt" },
      { id: "t15", type: "closed", at: d(10), by: "Dr. Hofmann", description: "Konsil geschlossen" },
    ],
  },
  {
    id: "K-2026-0005",
    patientId: "p_005",
    createdByUserId: "u_hausarzt_1",
    createdAt: d(0, 9),
    updatedAt: d(0, 9),
    status: "submitted",
    urgency: "soon",
    reason: "Akut entzündliches Ekzem am Rücken (10 J., Neurodermitis)",
    clinicalDescription:
      "Akute Verschlechterung der atopischen Dermatitis mit ausgedehntem Erythem und Exkoriationen am Rücken.",
    symptomDuration: "5 Tage",
    suspectedDiagnosis: "Atopisches Ekzem Schub",
    previousTreatments: "Basispflege mit Linola, Hydrocortison 1%",
    additionalInfo: "Patientin wirkt sehr leidvoll, deutlicher Juckreiz, Schlafstörung.",
    selectedBodyRegions: ["back", "neck"],
    images: [
      { id: "i10", filename: "rücken_kind_01.jpg", source: "mobile", uploadedAt: d(0, 9), label: "Übersicht" },
    ],
    messages: [],
    timeline: [
      { id: "t16", type: "created", at: d(0, 9), by: "Dr. Hofmann", description: "Konsil erstellt" },
      { id: "t17", type: "submitted", at: d(0, 9), by: "Dr. Hofmann", description: "An Dermatologie übermittelt" },
    ],
  },
  {
    id: "K-2026-0006",
    patientId: "p_006",
    createdByUserId: "u_hausarzt_1",
    assignedExpertId: "u_derm_1",
    createdAt: d(14),
    updatedAt: d(13),
    status: "answered",
    urgency: "soon",
    reason: "Schuppende Plaques an Ellenbogen und Knien",
    clinicalDescription:
      "Erythemato-squamöse Plaques mit silbriger Schuppung an Streckseiten der Ellenbogen und Knie.",
    symptomDuration: "ca. 4 Monate",
    suspectedDiagnosis: "Psoriasis vulgaris",
    previousTreatments: "Keine",
    selectedBodyRegions: ["arm-left", "arm-right", "leg-left", "leg-right"],
    images: [
      { id: "i11", filename: "ellenbogen.jpg", source: "desktop", uploadedAt: d(14) },
      { id: "i12", filename: "knie.jpg", source: "desktop", uploadedAt: d(14) },
    ],
    messages: [
      {
        id: "m8",
        senderRole: "dermatologist",
        senderName: "Dr. Weber",
        createdAt: d(13),
        body: "Klinik vereinbar mit Psoriasis vulgaris. Empfehlung zu Calcipotriol/Betamethason.",
      },
    ],
    expertAssessment: {
      assessment: "Klinisches Bild typisch für eine Psoriasis vulgaris Typ I.",
      recommendedDiagnosis: "Psoriasis vulgaris (L40.0)",
      differentialDiagnoses: ["Nummuläres Ekzem", "Pityriasis rubra pilaris"],
      recommendedTreatment:
        "Calcipotriol/Betamethason Schaum 1x tgl. für 4 Wochen, parallel UV-Schutz und Hautpflege.",
      nextSteps: "Vorstellung in dermatologischer Praxis bei Therapieversagen oder Ausdehnung.",
      inPersonAppointmentRecommended: false,
      urgencyRecommendation: "soon",
      authoredAt: d(13),
      authoredBy: "Dr. Weber",
    },
    timeline: [
      { id: "t18", type: "created", at: d(14), by: "Dr. Hofmann", description: "Konsil erstellt" },
      { id: "t19", type: "submitted", at: d(14), by: "Dr. Hofmann", description: "An Dermatologie übermittelt" },
      { id: "t20", type: "answered", at: d(13), by: "Dr. Weber", description: "Befund übermittelt" },
    ],
  },
  {
    id: "K-2026-0007",
    patientId: "p_002",
    createdByUserId: "u_hausarzt_1",
    createdAt: d(1, 14),
    updatedAt: d(1, 14),
    status: "submitted",
    urgency: "routine",
    reason: "Verdacht auf Onychomykose",
    clinicalDescription:
      "Bräunliche Verdickung des Großzehennagels rechts, langsam zunehmend seit ca. 6 Monaten.",
    symptomDuration: "6 Monate",
    suspectedDiagnosis: "Onychomykose",
    previousTreatments: "Bifonazol Nagelset OTC",
    selectedBodyRegions: ["foot-right"],
    images: [
      { id: "i13", filename: "zehennagel.jpg", source: "desktop", uploadedAt: d(1, 14) },
    ],
    messages: [],
    timeline: [
      { id: "t21", type: "created", at: d(1, 14), by: "Dr. Hofmann", description: "Konsil erstellt" },
      { id: "t22", type: "submitted", at: d(1, 14), by: "Dr. Hofmann", description: "An Dermatologie übermittelt" },
    ],
  },
  {
    id: "K-2026-0008",
    patientId: "p_003",
    createdByUserId: "u_hausarzt_1",
    assignedExpertId: "u_derm_1",
    createdAt: d(20),
    updatedAt: d(18),
    status: "closed",
    urgency: "routine",
    reason: "Pigmentveränderung am Dekolleté",
    clinicalDescription:
      "Bräunliche, scharf begrenzte Makula präklavikulär rechts, ca. 6 mm, seit Monaten stabil.",
    symptomDuration: "stabil seit > 6 Monaten",
    selectedBodyRegions: ["chest"],
    images: [
      { id: "i14", filename: "dekollete.jpg", source: "desktop", uploadedAt: d(20) },
    ],
    messages: [
      {
        id: "m9",
        senderRole: "dermatologist",
        senderName: "Dr. Weber",
        createdAt: d(18),
        body: "Bild zeigt eine reguläre Lentigo simplex. Keine weitere Maßnahme nötig.",
      },
    ],
    expertAssessment: {
      assessment: "Reguläre Lentigo simplex, keine Malignitätshinweise.",
      recommendedDiagnosis: "Lentigo simplex (L81.4)",
      differentialDiagnoses: ["Lentigo solaris"],
      recommendedTreatment: "Keine spezifische Therapie notwendig.",
      nextSteps: "UV-Schutz empfohlen.",
      inPersonAppointmentRecommended: false,
      urgencyRecommendation: "routine",
      authoredAt: d(18),
      authoredBy: "Dr. Weber",
    },
    timeline: [
      { id: "t23", type: "created", at: d(20), by: "Dr. Hofmann", description: "Konsil erstellt" },
      { id: "t24", type: "submitted", at: d(20), by: "Dr. Hofmann", description: "An Dermatologie übermittelt" },
      { id: "t25", type: "answered", at: d(18), by: "Dr. Weber", description: "Befund übermittelt" },
      { id: "t26", type: "closed", at: d(18), by: "Dr. Hofmann", description: "Konsil geschlossen" },
    ],
  },
];
