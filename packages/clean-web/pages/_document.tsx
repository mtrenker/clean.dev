import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render () {
    return (
      <Html>
        <Head>
          <link href="https://use.typekit.net/eaw0lly.css" rel="stylesheet" />
          <meta content="https://clean.dev" property="og:url" />
          <meta content="clean.dev" property="og:title" />
          <meta content="Hi, I'm Martin and I love code!" property="og:description" />
          <meta content="clean.dev" property="og:site_name" />
          <meta content="summary_large_image" name="twitter:card" />
          <meta content="@martintrenker" name="twitter:creator" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
