import { z } from "zod";


export const clientSourcePageSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  sourceType: z.enum([
    "user-supplied-material",
    "official-website",
    "official-business-profile",
    "official-social",
    "secondary-source",
  ]),
  purpose: z.enum([
    "identity",
    "offer",
    "services",
    "about",
    "location",
    "conversion",
    "visual",
    "discovery",
  ]),
  notes: z.array(z.string().min(1)).default([]),
});

export const clientEvidenceFactSchema = z.object({
  field: z.enum([
    "brandName",
    "businessType",
    "location",
    "offer",
    "servicesOrProducts",
    "audience",
    "conversionGoal",
    "primaryCta",
    "primaryCtaHref",
    "brandTraits",
    "palette",
    "visualIdentityNotes",
    "visualOpportunities",
    "constraints",
    "availableAssets",
    "currentSiteFriction",
    "preserve",
    "contentLanguage",
    "market",
  ]),
  value: z.string().min(1),
  sourceUrl: z.string().url(),
  status: z.enum(["explicit", "inferred"]),
  confidence: z.enum(["high", "medium", "low"]),
  rationale: z.string().min(3),
});

export const clientResearchBundleSchema = z.object({
  projectId: z.string().min(1),
  requestedUrl: z.string().url(),
  canonicalUrl: z.string().url().optional(),
  pages: z.array(clientSourcePageSchema).min(1).max(20),
  facts: z.array(clientEvidenceFactSchema).min(4).max(80),
  unresolvedQuestions: z.array(z.string().min(1)).default([]),
  researchNotes: z.array(z.string().min(1)).default([]),
});

export const clientAnalysisSchema = z.object({
  projectId: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  brandName: z.string().min(1),
  contentLanguage: z.string().min(2).default("en"),
  market: z.string().min(2).optional(),
  businessType: z.string().min(2),
  location: z.string().optional(),
  offer: z.string().min(2),
  servicesOrProducts: z.array(z.string().min(1)).min(1),
  audience: z.string().min(2),
  conversionGoal: z.string().min(2),
  primaryCta: z.string().min(1),
  primaryCtaHref: z.string().min(1).optional(),
  brandTraits: z.array(z.string().min(1)).min(2).max(6),
  palette: z.array(z.string().min(1)).max(8).default([]),
  visualIdentityNotes: z.array(z.string().min(1)).default([]),
  visualOpportunities: z.array(z.string().min(1)).min(1),
  constraints: z.array(z.string().min(1)).default([]),
  availableAssets: z.array(z.string().min(1)).default([]),
  currentSiteFriction: z.array(z.string().min(1)).default([]),
  preserve: z.array(z.string().min(1)).default([]),
  evidenceNotes: z.array(z.string().min(1)).default([]),
});

export const qaIssueSchema = z.object({
  viewport: z.enum(["desktop", "tablet", "mobile", "reduced-motion"]),
  checkpoint: z.number().min(0).max(1),
  severity: z.enum(["low", "medium", "high", "blocking"]),
  issue: z.string().min(3),
  proposedFix: z.string().min(3),
  parameter: z.string().optional(),
  before: z.union([z.string(), z.number()]).optional(),
  after: z.union([z.string(), z.number()]).optional(),
});

export const qaCheckpointSchema = z.object({
  viewport: z.enum(["desktop", "tablet", "mobile", "reduced-motion"]),
  checkpoint: z.number().min(0).max(1),
  status: z.enum(["pass", "issue"]),
  notes: z.array(z.string()).default([]),
});

export const qaReportSchema = z.object({
  projectId: z.string().min(1),
  checkpoints: z.array(qaCheckpointSchema).min(5),
  heroMoment: z.enum(["pass", "issue"]),
  cta: z.enum(["pass", "issue"]),
  responsiveComposition: z.enum(["pass", "issue"]),
  performanceFallback: z.enum(["pass", "issue"]),
  reducedMotion: z.enum(["pass", "issue"]),
  contentLanguage: z.enum(["pass", "issue"]).default("pass"),
  finalConversionState: z.enum(["pass", "issue"]).default("pass"),
  issues: z.array(qaIssueSchema).default([]),
  finalStatus: z.enum(["pass", "needs-fixes"]),
});

export type ClientResearchBundle = z.infer<typeof clientResearchBundleSchema>;
export type ClientAnalysis = z.infer<typeof clientAnalysisSchema>;
export type QAReport = z.infer<typeof qaReportSchema>;
