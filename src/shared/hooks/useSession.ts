// React Context 를 쓰는 next-auth 의 default useSession 을 쓰지 않고 React Query 를 쓰는 이 훅을 쓴다.

import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { User } from '@prisma/client'

export async function fetchSession() {
  const res = await fetch('/api/auth/session')
  const session = await res.json()
  if (Object.keys(session).length) {
    return session
  }
  return null
}

interface Props {
  required?: boolean
  redirectTo?: string
  queryConfig?: Record<string, any>
}

export function useSession({
  required = false,
  redirectTo = '/api/auth/signin?error=SessionExpired',
  queryConfig = {},
}: Props = {}): [User | null, boolean] {
  const router = useRouter()
  const query = useQuery(['session'], fetchSession, {
    ...queryConfig,
    onSettled(data, error) {
      if (queryConfig.onSettled) queryConfig.onSettled(data, error)
      if (data || !required) return
      router.push(redirectTo)
    },
  })
  return [query.data, query.status === 'loading']
}
