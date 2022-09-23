import Head from 'next/head'
import { withTRPC } from '@trpc/next'
import type { AppRouter } from '../server/router'
import superjson from 'superjson'
import '../styles/globals.css'
import '../styles/calendar.css'
import type { AppProps } from 'next/app'
// import { loggerLink } from '@trpc/client/links/loggerLink'
import { httpBatchLink } from '@trpc/client/links/httpBatchLink'
import { getBaseUrl } from '../utils/url'
import { toast, ToastContainer, Slide } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { RecoilRoot } from 'recoil'
import { useLastPathTracker } from 'src/shared/hooks'
import type { NextPage } from 'next'
import { Auth } from 'src/components/auth'
import ConditionalWrapper from 'src/components/ConditionalWrapper'

type NextPageWithAuth<P = {}, IP = P> = NextPage<P, IP> & { auth?: boolean }

interface MyAppProps extends AppProps {
  Component: NextPageWithAuth
}

function MyApp({ Component, pageProps: { session, ...pageProps } }: MyAppProps) {
  useLastPathTracker()

  return (
    <>
      <Head>
        <title>노크노크</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
      </Head>
      <RecoilRoot>
        <ConditionalWrapper condition={!!Component.auth} wrapper={children => <Auth>{children}</Auth>}>
          <div className="w-full min-h-screen">
            <main className="w-full min-h-screen md:max-w-sm mx-auto bg-bgColor text-white">
              <Component {...pageProps} />
            </main>
          </div>
        </ConditionalWrapper>
        <ToastContainer
          position={toast.POSITION.TOP_CENTER}
          autoClose={1000}
          hideProgressBar={true}
          transition={Slide}
        />
      </RecoilRoot>
    </>
  )
}

// withTRPC 에 react-query 의 QueryClient 포함되어 있음
export default withTRPC<AppRouter>({
  config({ ctx }) {
    const url = `${getBaseUrl()}/api/trpc`

    const links = [
      // loggerLink(),
      httpBatchLink({
        maxBatchSize: 10,
        url,
      }),
    ]

    return {
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000 * 60 * 3, // 3 hours
            refetchInterval: 60 * 1000 * 5, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      },
      headers() {
        if (ctx?.req)
          return {
            ...ctx.req.headers,
            'x-ssr': '1',
          }
        return {}
      },
      links,
      transformer: superjson,
    }
  },
  ssr: false,
})(MyApp)
