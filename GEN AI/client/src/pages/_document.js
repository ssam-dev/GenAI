import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="ArtisanCraft - Discover authentic cultural treasures from skilled artisans across the country. Handcrafted products with rich cultural heritage and traditional techniques." />
        <meta name="keywords" content="artisan, crafts, cultural products, handmade, traditional, cultural heritage, e-commerce" />
        <meta name="author" content="ArtisanCraft" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ArtisanCraft - Authentic Cultural Treasures" />
        <meta property="og:description" content="Discover authentic cultural treasures from skilled artisans across the country." />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="ArtisanCraft - Authentic Cultural Treasures" />
        <meta property="twitter:description" content="Discover authentic cultural treasures from skilled artisans across the country." />
        <meta property="twitter:image" content="/og-image.jpg" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
