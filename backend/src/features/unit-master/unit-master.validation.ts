import { z } from 'zod';

export const createUnitMasterSchema = z.object({
  name: z.string().min(1, 'Unit name is required (e.g. কেজি, প্যাকেট, পিস, বস্তা, কার্টন)'),
  banglaName: z.string().optional(),
  category: z.string().optional().default('GENERAL'),
  isDefault: z.boolean().optional().default(false),
});

export const updateUnitMasterSchema = createUnitMasterSchema.partial();

export type CreateUnitMasterInput = z.infer<typeof createUnitMasterSchema>;
export type UpdateUnitMasterInput = z.infer<typeof updateUnitMasterSchema>;
