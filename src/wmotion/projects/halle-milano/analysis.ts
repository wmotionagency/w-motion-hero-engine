import { clientAnalysisSchema } from "@/wmotion/workflow/schemas";

export const halleMilanoAnalysis = clientAnalysisSchema.parse({
  projectId: "halle-milano-hero",
  sourceUrl: "https://www.hallemilano.com/",
  brandName: "Halle",
  contentLanguage: "it",
  market: "IT",
  businessType: "Hair studio with a connected cultural and creative program",
  location: "Via Mantova 17, Milano",
  offer: "Genderless cuts, color, bleaching and styling with a strong identity-led approach",
  servicesOrProducts: [
    "Design cuts",
    "Color and toner services",
    "Bleaching services",
    "Treatments and styling",
  ],
  audience: "Style-conscious people who value individuality, experimentation and contemporary culture",
  conversionGoal: "Book an appointment",
  primaryCta: "Book Now",
  brandTraits: [
    "genderless",
    "experimental",
    "community-led",
    "culture-connected",
  ],
  palette: [],
  visualIdentityNotes: [
    "Nippo-Berlin street style and fashion references",
    "Editorial community photography is already part of the brand language",
    "RAUM extends Halle into emerging art and creative culture",
  ],
  visualOpportunities: [
    "Turn Halle's own identity contrasts into a kinetic editorial system",
    "Use category collision and alignment as a metaphor for individuality without fixed labels",
    "Let typography carry the concept so the experience remains fast and art-directed",
  ],
  constraints: [
    "Do not make the hero look like a generic luxury salon",
    "Do not over-explain the concept with copy",
    "Preserve a strong mobile version",
  ],
  availableAssets: [
    "Halle Zine community photography",
    "Team imagery",
    "Existing HALLE brand identity",
  ],
  currentSiteFriction: [
    "Several strong brand worlds are present, but the homepage does not immediately unify them into one dominant proposition in the crawled content",
  ],
  preserve: [
    "Book Now as the primary conversion action",
    "The relationship between hair, community and emerging creative culture",
    "Genderless and experimental positioning",
  ],
  evidenceNotes: [
    "Genderless cuts and color contrasts are directly supported by the official Team page.",
    "The Zine explicitly centers community, individuality and opposing identity pairs.",
    "RAUM confirms that Halle hosts emerging creative work beyond salon services.",
    "Booking is inferred as the main conversion goal because Book Now is a primary homepage action.",
  ],
});
