import { atom } from 'recoil'
import { InferQueryOutput } from 'src/utils/trpc'
import { AnonymousUser } from './types'

export const user = atom<InferQueryOutput<'users.me'>>({
  key: 'user',
  default: null,
})

export const anonymousUserState = atom<AnonymousUser>({
  key: 'anonymousUser',
  default: undefined,
})
