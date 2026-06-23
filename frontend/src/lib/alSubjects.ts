// Sri Lankan G.C.E. A/L and O/L subject definitions

export type ALStream =
    | "PHYSICAL_SCIENCE"
    | "BIOLOGICAL_SCIENCE"
    | "COMMERCE"
    | "TECHNOLOGY"
    | "ARTS";

export const AL_STREAM_LABELS: Record<ALStream, string> = {
    PHYSICAL_SCIENCE:  "Physical Science",
    BIOLOGICAL_SCIENCE:"Biological Science",
    COMMERCE:          "Commerce",
    TECHNOLOGY:        "Technology",
    ARTS:              "Arts",
};

// Subjects that are automatically assigned (cannot be changed) for each stream
export const AL_MANDATORY_SUBJECTS: Record<ALStream, string[]> = {
    PHYSICAL_SCIENCE:   ["COMBINED_MATHEMATICS", "PHYSICS"],
    BIOLOGICAL_SCIENCE: ["BIOLOGY", "CHEMISTRY"],
    COMMERCE:           ["ACCOUNTING", "ECONOMICS"],
    TECHNOLOGY:         ["SCIENCE_FOR_TECHNOLOGY"],
    ARTS:               [],
};

// For Technology stream: choose one primary technical subject as 2nd subject
export const AL_TECHNOLOGY_PRIMARY: string[] = [
    "ENGINEERING_TECHNOLOGY",
    "BIO_SYSTEMS_TECHNOLOGY",
];

// Selectable 3rd (or 2nd+3rd for Arts) subjects per stream
export const AL_THIRD_SUBJECT_OPTIONS: Record<ALStream, string[]> = {
    PHYSICAL_SCIENCE:   ["CHEMISTRY", "ICT"],
    BIOLOGICAL_SCIENCE: ["PHYSICS", "AGRICULTURAL_SCIENCE", "ICT"],
    COMMERCE:           ["BUSINESS_STUDIES", "ICT", "BUSINESS_STATISTICS"],
    TECHNOLOGY:         ["ICT", "AGRICULTURAL_SCIENCE", "ECONOMICS", "GEOGRAPHY", "ACCOUNTING", "ART", "ENGLISH", "BUSINESS_STUDIES"],
    ARTS:               [
        "ECONOMICS", "GEOGRAPHY", "HISTORY", "POLITICAL_SCIENCE",
        "LOGIC_SCIENTIFIC_METHOD", "COMMUNICATION_MEDIA_STUDIES",
        "SINHALA", "TAMIL", "ENGLISH", "FRENCH", "JAPANESE", "CHINESE", "GERMAN", "ARABIC",
        "PALI", "SANSKRIT",
        "ART", "DANCING_SINHALA", "DANCING_BHARATA", "DRAMA_THEATRE",
        "MUSIC_ORIENTAL", "MUSIC_WESTERN", "MUSIC_CARNATIC",
        "BUDDHISM", "BUDDHIST_CIVILIZATION",
        "HINDUISM", "HINDU_CIVILIZATION",
        "ISLAM", "ISLAMIC_CIVILIZATION",
        "CHRISTIAN_CIVILIZATION", "GREEK_ROMAN_CIVILIZATION",
    ],
};

export const AL_SUBJECT_LABELS: Record<string, string> = {
    COMBINED_MATHEMATICS:      "Combined Mathematics",
    PHYSICS:                   "Physics",
    CHEMISTRY:                 "Chemistry",
    BIOLOGY:                   "Biology",
    ICT:                       "Information & Communication Technology",
    AGRICULTURAL_SCIENCE:      "Agricultural Science",
    ACCOUNTING:                "Accounting",
    ECONOMICS:                 "Economics",
    BUSINESS_STUDIES:          "Business Studies",
    BUSINESS_STATISTICS:       "Business Statistics",
    SCIENCE_FOR_TECHNOLOGY:    "Science for Technology",
    ENGINEERING_TECHNOLOGY:    "Engineering Technology",
    BIO_SYSTEMS_TECHNOLOGY:    "Bio-Systems Technology",
    GEOGRAPHY:                 "Geography",
    HISTORY:                   "History",
    POLITICAL_SCIENCE:         "Political Science",
    LOGIC_SCIENTIFIC_METHOD:   "Logic & Scientific Method",
    COMMUNICATION_MEDIA_STUDIES:"Communication & Media Studies",
    SINHALA:                   "Sinhala",
    TAMIL:                     "Tamil",
    ENGLISH:                   "English",
    FRENCH:                    "French",
    JAPANESE:                  "Japanese",
    CHINESE:                   "Chinese",
    GERMAN:                    "German",
    ARABIC:                    "Arabic",
    PALI:                      "Pali",
    SANSKRIT:                  "Sanskrit",
    ART:                       "Art",
    DANCING_SINHALA:           "Dancing (Oriental)",
    DANCING_BHARATA:           "Dancing (Bharata)",
    DRAMA_THEATRE:             "Drama & Theatre",
    MUSIC_ORIENTAL:            "Music (Oriental)",
    MUSIC_WESTERN:             "Music (Western)",
    MUSIC_CARNATIC:            "Music (Carnatic)",
    BUDDHISM:                  "Buddhism",
    BUDDHIST_CIVILIZATION:     "Buddhist Civilization",
    HINDUISM:                  "Hinduism",
    HINDU_CIVILIZATION:        "Hindu Civilization",
    ISLAM:                     "Islam",
    ISLAMIC_CIVILIZATION:      "Islamic Civilization",
    CHRISTIAN_CIVILIZATION:    "Christian Civilization",
    GREEK_ROMAN_CIVILIZATION:  "Greek & Roman Civilization",
};

// ── O/L Subjects ─────────────────────────────────────────────────────────────

export const OL_GRADES = ["A", "B", "C", "S", "W"] as const;
export type OLGrade = typeof OL_GRADES[number];

export const OL_GRADE_LABELS: Record<OLGrade, string> = {
    A: "A — Distinction",
    B: "B — Credit",
    C: "C — Merit",
    S: "S — Simple Pass",
    W: "W — Weak Pass / Fail",
};

// Mother tongue options (maps to the OL subject stored value)
export const OL_MOTHER_TONGUE_OPTIONS = [
    { value: "SINHALA_LANGUAGE", label: "Sinhala Language & Literature" },
    { value: "TAMIL_LANGUAGE",   label: "Tamil Language & Literature" },
];

// Religion options
export const OL_RELIGION_OPTIONS = [
    { value: "BUDDHISM",      label: "Buddhism" },
    { value: "ISLAM",         label: "Islam" },
    { value: "HINDUISM",      label: "Hinduism" },
    { value: "CHRISTIANITY",  label: "Christianity" },
    { value: "CATHOLICISM",   label: "Catholicism" },
];

// Category A — Aesthetic (choose 1)
export const OL_CATEGORY_A = [
    { value: "ART_PAINTING",       label: "Art / Painting" },
    { value: "DANCING_ORIENTAL",   label: "Dancing (Oriental)" },
    { value: "DANCING_BHARATA",    label: "Dancing (Bharata)" },
    { value: "MUSIC_ORIENTAL",     label: "Music (Oriental)" },
    { value: "MUSIC_WESTERN",      label: "Music (Western)" },
    { value: "MUSIC_CARNATIC",     label: "Music (Carnatic)" },
    { value: "DRAMA_THEATRE",      label: "Drama & Theatre" },
];

// Category B — Technical / Vocational (choose 1)
export const OL_CATEGORY_B = [
    { value: "ICT",                        label: "Information & Communication Technology" },
    { value: "AGRICULTURE_FOOD_TECH",      label: "Agriculture & Food Technology" },
    { value: "HOME_ECONOMICS",             label: "Home Economics" },
    { value: "HEALTH_PHYSICAL_EDUCATION",  label: "Health & Physical Education" },
    { value: "COMMUNICATION_MEDIA",        label: "Communication & Media Studies" },
    { value: "ARTS_CRAFTS",                label: "Art & Crafts / Design Technology" },
];

// Category C — Humanities & Languages (choose 1)
export const OL_CATEGORY_C = [
    { value: "GEOGRAPHY",             label: "Geography" },
    { value: "CIVIC_EDUCATION",       label: "Civic Education" },
    { value: "BUSINESS_ACCOUNTING",   label: "Business & Accounting Studies" },
    { value: "ENTREPRENEURSHIP",      label: "Entrepreneurship Studies" },
    { value: "LITERATURE_ENGLISH",    label: "Literature in English" },
    { value: "LITERATURE_SINHALA",    label: "Literature in Sinhala" },
    { value: "LITERATURE_TAMIL",      label: "Literature in Tamil" },
    { value: "LITERATURE_ARABIC",     label: "Literature in Arabic" },
    { value: "SECOND_LANG_SINHALA",   label: "Second Language — Sinhala" },
    { value: "SECOND_LANG_TAMIL",     label: "Second Language — Tamil" },
    { value: "PALI",                  label: "Pali" },
    { value: "SANSKRIT",              label: "Sanskrit" },
    { value: "FRENCH",                label: "French" },
    { value: "GERMAN",                label: "German" },
    { value: "HINDI",                 label: "Hindi" },
    { value: "ARABIC",                label: "Arabic" },
];

// Strict valid combinations for validation
export function isValidALCombination(stream: ALStream, subjects: string[]): boolean {
    if (subjects.length !== 3) return false;

    const mandatory = AL_MANDATORY_SUBJECTS[stream];
    const thirdOptions = AL_THIRD_SUBJECT_OPTIONS[stream];

    if (stream === "TECHNOLOGY") {
        // Must have SFT + one of ET/BST + one from the basket
        const hasSFT = subjects.includes("SCIENCE_FOR_TECHNOLOGY");
        const hasPrimary = subjects.some(s => AL_TECHNOLOGY_PRIMARY.includes(s));
        const third = subjects.find(s => s !== "SCIENCE_FOR_TECHNOLOGY" && !AL_TECHNOLOGY_PRIMARY.includes(s));
        return hasSFT && hasPrimary && third != null && thirdOptions.includes(third);
    }

    if (stream === "ARTS") {
        return subjects.every(s => thirdOptions.includes(s)) && new Set(subjects).size === 3;
    }

    // For all other streams: must contain both mandatory subjects + exactly one valid 3rd
    const hasMandatory = mandatory.every(m => subjects.includes(m));
    const third = subjects.find(s => !mandatory.includes(s));
    return hasMandatory && third != null && thirdOptions.includes(third);
}
