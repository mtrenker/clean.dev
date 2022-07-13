import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Layout } from '../components/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Layout />
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
