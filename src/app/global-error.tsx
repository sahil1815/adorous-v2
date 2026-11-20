'use client';

import React, { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  retry?: () => void;
}

export default function GlobalError({ error, reset, retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[Global Error Boundary]', error);
  }, [error]);

  const handleRetry = () => {
    if (typeof retry === 'function') {
      retry();
    } else if (typeof reset === 'function') {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Atelier Notice | Adorous Fashion</title>
        <style>{`
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
            max-width: 540px;
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
          .ref {
            font-family: monospace;
            font-size: 10px;
            color: #888;
            margin-bottom: 24px;
          }
          .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
          }
          .btn-primary {
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
            border: none;
            border-radius: 2px;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            transition: background 0.2s;
          }
          .btn-primary:hover {
            background: #E5C358;
          }
          .btn-secondary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 28px;
            background: transparent;
            color: #1A1A1A;
            font-weight: 600;
            font-size: 11px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            text-decoration: none;
            border: 1px solid #D4AF37;
            border-radius: 2px;
            cursor: pointer;
            transition: background 0.2s;
          }
          .btn-secondary:hover {
            background: #F0ECE4;
          }
        `}</style>
      </head>
      <body>
        <div className="box">
          <div className="icon-wrap">✧</div>
          <div className="badge">Status Code 500 · Atelier Pause</div>
          <h1>An Unforeseen Interruption</h1>
          <p>We encountered an unexpected moment while preparing your session. Please retry or return to our main atelier boutique.</p>
          {error?.digest && (
            <div className="ref">Reference Code: {error.digest}</div>
          )}
          <div className="actions">
            <button onClick={handleRetry} className="btn-primary">
              Try Again
            </button>
            <a href="/" className="btn-secondary">
              Return to Boutique
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
