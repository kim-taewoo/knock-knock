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
import { SessionProvider } from 'next-auth/react'
import { toast, ToastContainer, Slide } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { RecoilRoot } from 'recoil'
import { useLastPathTracker } from 'src/shared/hooks'
import { Auth } from 'src/components/auth'
import type { NextPage } from 'next'

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
        <SessionProvider session={session}>
          {Component.auth ? (
            <Auth>
              <div className="w-full min-h-screen">
                <main className="w-full md:max-w-sm min-h-screen mx-auto bg-bgColor text-white">
                  <Component {...pageProps} />
                </main>
              </div>
            </Auth>
          ) : (
            <div className="w-full min-h-screen">
              <main className="w-full md:max-w-sm min-h-screen mx-auto bg-bgColor text-white">
                <Component {...pageProps} />
              </main>
            </div>
          )}

          <ToastContainer
            position={toast.POSITION.TOP_CENTER}
            autoClose={1000}
            hideProgressBar={true}
            transition={Slide}
          />
        </SessionProvider>
      </RecoilRoot>
    </>
  )
}

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
            staleTime: 60,
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
