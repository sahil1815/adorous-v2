export const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5"/>
  <meta name="robots" content="noindex, nofollow"/>
  <title>Page Not Found (404) | Adorous Fashion Dhaka</title>
  <meta name="description" content="The requested piece or collection page could not be located in our atelier catalogue."/>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #FAF8F4;
      color: #1A1A1A;
      margin: 0;
      padding: 0;
      display: flex;
      min-height: 100vh;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .box {
      max-width: 580px;
      padding: 48px 24px;
      margin: 0 auto;
    }
    .icon-wrap {
      width: 56px;
      height: 56px;
      margin: 0 auto 20px;
      border-radius: 50%;
      background: #F0ECE4;
      border: 1px solid rgba(212, 175, 55, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8A6D3B;
      font-size: 24px;
    }
    .badge {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      color: #8A6D3B;
      font-weight: 600;
      margin-bottom: 12px;
    }
    h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 32px;
      font-weight: 500;
      margin: 0 0 16px;
      color: #1A1A1A;
      letter-spacing: -0.01em;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #555;
      margin: 0 0 28px;
    }
    .section-title {
      font-family: Georgia, serif;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #888;
      margin-bottom: 12px;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-bottom: 32px;
    }
    .pill {
      display: inline-block;
      padding: 8px 16px;
      background: #FAF8F4;
      border: 1px solid #E5E0D8;
      border-radius: 2px;
      color: #1A1A1A;
      text-decoration: none;
      font-size: 12px;
      transition: all 0.2s;
    }
    .pill:hover {
      background: #F0ECE4;
      border-color: #D4AF37;
      color: #8A6D3B;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 28px;
      background: #D4AF37;
      color: #1A1A1A;
      font-weight: 600;
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      text-decoration: none;
      border-radius: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      transition: background 0.2s;
    }
    .btn:hover {
      background: #E5C358;
    }
  </style>
</head>
<body>
  <div class="box">
    <div class="icon-wrap">✧</div>
    <div class="badge">Status Code 404 · Page Not Found</div>
    <h1>The Piece You Seek Has Shifted</h1>
    <p>This URL cannot be found in our current archives. The collection or product may have been renamed, archived, or moved within our boutique.</p>
    <div class="section-title">Explore Curated Collections</div>
    <div class="links">
      <a href="/jewelry" class="pill">Jewelry Sets</a>
      <a href="/churi" class="pill">Churi (Bangles)</a>
      <a href="/bags" class="pill">Ladies' Bags</a>
      <a href="/earrings" class="pill">Earrings</a>
      <a href="/shop" class="pill">All Pieces</a>
    </div>
    <a href="/" class="btn">Return to Homepage</a>
  </div>
</body>
</html>`;
