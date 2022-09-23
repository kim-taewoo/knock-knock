import z from 'zod'

export const createuserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  oauthId: z.string().optional(),
  image: z.string().optional().nullable(),
  emailVerified: z.date().optional(),
  tags: z.string(),
  introduction: z.string().optional(),
})

export type ICreateuser = z.TypeOf<typeof createuserSchema>
