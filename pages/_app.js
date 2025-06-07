// pages/_app.js
import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Wealth Sage</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Your financial assistant, all in one place." />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
