import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PDFPage, rgb } from "pdf-lib";

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    // Approximate character width based on font size
    const approxWidth = testLine.length * (fontSize * 0.55);

    if (approxWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export async function POST(request: NextRequest) {
  try {
    const { htmlContent, filename } = await request.json();

    if (!htmlContent) {
      return NextResponse.json(
        { success: false, error: "No content provided" },
        { status: 400 }
      );
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4 size in points
    let yPosition = 750;
    const marginLeft = 40;
    const marginRight = 40;
    const pageWidth = 595 - marginLeft - marginRight;
    const fontSize = 11;

    // Add title
    const titleText = 'Observation Médicale';
    const titleWidth = titleText.length * 7; // Approximate width
    page.drawText(titleText, {
      x: (595 - titleWidth) / 2,
      y: yPosition,
      size: 18,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    // Add date
    const today = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const dateText = `Fait le ${today}`;
    const dateWidth = dateText.length * 5;
    page.drawText(dateText, {
      x: 595 - marginRight - dateWidth,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    yPosition -= 25;

    // Strip HTML tags and parse content
    const plainText = htmlContent
      .replace(/<h1[^>]*>Observation Médicale<\/h1>/gi, '')
      .replace(/<h2[^>]*>/g, '\n### ')
      .replace(/<\/h2>/g, '')
      .replace(/<h3[^>]*>/g, '\n#### ')
      .replace(/<\/h3>/g, '')
      .replace(/<p[^>]*>/g, '')
      .replace(/<\/p>/g, '\n')
      .replace(/<li[^>]*>/g, '• ')
      .replace(/<\/li>/g, '\n')
      .replace(/<ul[^>]*>/g, '')
      .replace(/<\/ul>/g, '')
      .replace(/<ol[^>]*>/g, '')
      .replace(/<\/ol>/g, '')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<strong[^>]*>/g, '')
      .replace(/<\/strong>/g, '')
      .replace(/<b[^>]*>/g, '')
      .replace(/<\/b>/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();

    // Parse and render lines
    const lines = plainText.split('\n');

    for (const line of lines) {
      let currentFontSize = fontSize;
      let textColor = rgb(0, 0, 0);

      // Detect heading levels
      if (line.startsWith('### ')) {
        currentFontSize = 14;
        yPosition -= 8;
      } else if (line.startsWith('#### ')) {
        currentFontSize = 12;
        yPosition -= 5;
      }

      // Remove heading markers
      let textToDraw = line.replace(/^### |^#### /, '').trim();

      if (!textToDraw) {
        yPosition -= 8;
        continue;
      }

      // Wrap text to fit page width
      const wrappedLines = wrapText(textToDraw, pageWidth, currentFontSize);

      for (const wrappedLine of wrappedLines) {
        if (yPosition < 40) {
          page = pdfDoc.addPage([595, 842]);
          yPosition = 750;
        }

        page.drawText(wrappedLine, {
          x: marginLeft,
          y: yPosition,
          size: currentFontSize,
          color: textColor,
        });

        yPosition -= currentFontSize + 4;
      }

      yPosition -= 4; // Extra space between paragraphs
    }

    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename || 'observation.pdf'}"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate PDF",
      },
      { status: 500 }
    );
  }
}
