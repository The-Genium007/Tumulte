import { z } from 'zod'

export const inviteStreamerSchema = z.object({
  twitch_user_id: z
    .string()
    .min(1, "L'ID utilisateur Twitch est requis")
    .regex(/^\d+$/, "L'ID utilisateur Twitch doit être numérique"),
  twitch_login: z
    .string()
    .min(1, 'Le login Twitch est requis')
    .regex(/^[a-zA-Z0-9_]+$/, 'Le login Twitch contient des caractères invalides'),
  twitch_display_name: z.string().min(1, "Le nom d'affichage Twitch est requis"),
  profile_image_url: z.string().url().optional().nullable(),
})

export type InviteStreamerDto = z.infer<typeof inviteStreamerSchema>

export default inviteStreamerSchema
