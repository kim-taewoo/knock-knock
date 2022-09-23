import { ReactElement } from 'react'
import { useSession } from 'src/shared/hooks'
import LoadingPage from '../LoadingPage'

export function Auth({ children }: { children: ReactElement }) {
  // if `{ required: true }` is supplied, `status` can only be "loading" or "authenticated"
  const [isLoading] = useSession({
    required: true,
  })

  if (isLoading) {
    return <LoadingPage />
  }

  return children
}
