import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let browser: any;
  try {
    const { htmlContent, filename } = await request.json();

    if (!htmlContent) {
      return NextResponse.json(
        { success: false, error: "No content provided" },
        { status: 400 }
      );
    }

    // Build complete HTML document with styling
    const htmlDocument = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Observation Médicale</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20mm;
          }
          h1 {
            font-size: 24px;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
            text-align: center;
          }
          h2 {
            font-size: 18px;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 8px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          h3 {
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
            margin-bottom: 5px;
          }
          p {
            margin-bottom: 8px;
            text-align: justify;
          }
          ul, ol {
            margin-left: 20px;
            margin-bottom: 8px;
          }
          li {
            margin-bottom: 4px;
          }
          .date {
            text-align: right;
            margin-top: 10px;
            font-style: italic;
          }
          body > h1:nth-of-type(2) {
            display: none;
          }
          @page {
            margin: 10mm;
            size: A4;
          }
        </style>
      </head>
      <body>
        <h1 style="text-align: center; font-size: 28px; margin-bottom: 30px;">Observation Médicale</h1>
        ${htmlContent}
        <div class="date">Fait le ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </body>
      </html>
    `;

    const isProduction = process.env.NODE_ENV === 'production';
    const browserlessToken = process.env.BROWSERLESS_TOKEN;

    if (isProduction && browserlessToken) {
      // Production: Use Browserless.io with puppeteer-core
      console.log('Connecting to Browserless.io');
      const puppeteerCore = await import('puppeteer-core');
      const browserlessUrl = `wss://chrome.browserless.io?token=${browserlessToken}`;
      browser = await puppeteerCore.default.connect({ browserWSEndpoint: browserlessUrl });
    } else if (isProduction) {
      // Production without token - use Playwright or fallback
      console.log('Production mode: Using remote browser via Microsoft Playwright');
      throw new Error('BROWSERLESS_TOKEN environment variable is required for production. Please set it in your Vercel project settings.');
    } else {
      // Local development - use standard puppeteer
      console.log('Development mode: Using local Puppeteer');
      const puppeteer = await import('puppeteer');
      browser = await puppeteer.default.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });
    }

    const page = await browser.newPage();
    await page.setContent(htmlDocument, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm',
      },
      printBackground: true,
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename || 'observation.pdf'}"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (browser) {
      await browser.close().catch(() => {});
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate PDF",
      },
      { status: 500 }
    );
  }
}
