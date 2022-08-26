import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render () {
    return (
      <Html>
        <Head>
          <link href="https://use.typekit.net/eaw0lly.css" rel="stylesheet" />
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
