import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";

export async function POST(request: NextRequest) {
  let browser;
  try {
    const { htmlContent, filename } = await request.json();

    if (!htmlContent) {
      return NextResponse.json(
        { success: false, error: "No content provided" },
        { status: 400 }
      );
    }

    // Determine if we're in production or development
    const isProduction = process.env.NODE_ENV === 'production';

    // Launch puppeteer-core with appropriate configuration
    const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    };

    // For production, use remote Chromium (Browserless.io or similar)
    // For local development, use installed Chromium
    if (isProduction && process.env.BROWSERLESS_TOKEN) {
      const browserlessToken = process.env.BROWSERLESS_TOKEN;
      const browserlessUrl = `wss://chrome.browserless.io?token=${browserlessToken}`;
      browser = await puppeteer.connect({ browserWSEndpoint: browserlessUrl });
    } else {
      // Local development - try to find Chrome/Chromium
      const fs = await import('fs');

      // Look for Chromium installed by Puppeteer - search common cache locations
      const homeDir = process.env.HOME || process.env.USERPROFILE || '';
      let puppeteerChromePath: string | undefined;

      if (homeDir) {
        try {
          const cacheDir = `${homeDir}/.cache/puppeteer`;
          if (fs.existsSync(cacheDir)) {
            const versions = fs.readdirSync(cacheDir);
            for (const version of versions) {
              const chromePath = `${cacheDir}/${version}/chrome-linux64/chrome`;
              if (fs.existsSync(chromePath)) {
                puppeteerChromePath = chromePath;
                console.log(`Found Puppeteer Chrome at: ${puppeteerChromePath}`);
                break;
              }
            }
          }
        } catch (e) {
          console.log('Error searching for Puppeteer Chrome:', e);
        }
      }

      const possiblePaths = [
        process.env.CHROME_PATH,
        process.env.PUPPETEER_EXECUTABLE_PATH,
        puppeteerChromePath,
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      ].filter((p): p is string => Boolean(p));

      // Find first available executable
      let executablePath: string | undefined;
      for (const candidatePath of possiblePaths) {
        try {
          if (fs.existsSync(candidatePath)) {
            executablePath = candidatePath;
            console.log(`Using Chrome at: ${executablePath}`);
            break;
          }
        } catch (e) {
          console.log(`Chrome not found at ${candidatePath}`);
        }
      }

      if (!executablePath) {
        throw new Error(
          'Chrome/Chromium not found. Please install it with: npx puppeteer browsers install chrome'
        );
      }

      launchOptions.executablePath = executablePath;
      browser = await puppeteer.launch(launchOptions);
    }

    const page = await browser.newPage();

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

    await page.setContent(htmlDocument, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm',
      },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
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
