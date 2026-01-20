import { z } from 'zod'

export const updateOverlaySchema = z.object({
  // null = use system default overlay, string = overlay config ID
  overlayConfigId: z.string().uuid('ID de configuration invalide').nullable(),
})

export type UpdateOverlayDto = z.infer<typeof updateOverlaySchema>

export default updateOverlaySchema
