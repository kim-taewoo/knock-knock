import { useSession } from 'next-auth/react'
import { ReactElement } from 'react'
import LoadingPage from '../LoadingPage'

export function Auth({ children }: { children: ReactElement }) {
  // if `{ required: true }` is supplied, `status` can only be "loading" or "authenticated"
  const { status } = useSession({ required: true })

  if (status === 'loading') {
    return <LoadingPage />
  }

  return children
}
