import { z } from 'zod';

export const CATEGORIES_LIST = [
  'Artificial Intelligence & Machine Learning',
  'Biotechnology & Bio-Sensors',
  'Quantum & Optoelectronics',
  'Autonomous Systems & Robotics',
  'Cybersecurity & Cryptography',
  'Materials Science & Energy',
  'Telecommunications & 6G',
  'Medical Devices & Healthcare',
  'Software & Cloud Computing',
  'Other / Interdisciplinary',
];

export const DOMAINS_LIST = [
  'Deep Neural Network Architectures',
  'Quantum Micro-Fluidics',
  'Graphene Nanomaterials',
  'Zero-Knowledge Edge Protocols',
  'Autonomous Collision Avoidance',
  'Solid-State Battery Electrolytes',
  'Transformer Video Compression',
  'Gene Editing & CRISPR Carriers',
  'Micro-Electromechanical Sensors (MEMS)',
  'Photonic Computing Interconnects',
];

// Step 1: Basic Information
export const step1Schema = z.object({
  title: z
    .string()
    .min(5, 'Patent title must be at least 5 characters')
    .max(150, 'Patent title cannot exceed 150 characters'),
  category: z.string().min(1, 'Please select a patent category'),
  technologyDomain: z.string().min(1, 'Please select or enter a technology domain'),
  keywords: z
    .array(z.string())
    .min(1, 'Please add at least 1 keyword tag'),
  summary: z
    .string()
    .min(20, 'Short summary must be at least 20 characters')
    .max(1000, 'Summary cannot exceed 1000 characters'),
});

// Step 2: Patent Details
export const step2Schema = z.object({
  problemStatement: z
    .string()
    .min(15, 'Problem statement must be at least 15 characters'),
  existingSolution: z
    .string()
    .min(15, 'Existing solution description must be at least 15 characters'),
  proposedSolution: z
    .string()
    .min(15, 'Proposed solution description must be at least 15 characters'),
  novelFeatures: z
    .string()
    .min(15, 'Novel features description must be at least 15 characters'),
  workingPrinciple: z
    .string()
    .min(15, 'Working principle description must be at least 15 characters'),
  advantages: z
    .string()
    .min(15, 'Advantages description must be at least 15 characters'),
  applications: z
    .string()
    .min(15, 'Possible applications description must be at least 15 characters'),
  limitations: z.string().optional().default(''),
});

// Step 3: Supporting Documents
export const step3Schema = z.object({
  uploadedFiles: z.array(z.any()).optional().default([]),
});

// Step 4: Inventor Information
export const step4Schema = z.object({
  inventorName: z.string().min(2, 'Inventor name must be at least 2 characters'),
  organization: z.string().optional().default(''),
  email: z.string().email('Please enter a valid email address').or(z.literal('')),
  country: z.string().optional().default('United States'),
  state: z.string().optional().default(''),
  city: z.string().optional().default(''),
  visibility: z.enum(['Private', 'Public', 'Only Me']).default('Private'),
});

// Full Master Schema combining all steps
export const masterPatentSubmissionSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema);
