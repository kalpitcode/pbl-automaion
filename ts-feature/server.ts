import express, { Request, Response } from "express";
import cors from "cors";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

interface Student {
  name: string;
  reg: string;
  mobile: string;
  email: string;
}

interface ReportData {
  courseCode: string;
  semesterSection: string;
  facultySupervisor: string;
  weekInfo: string;
  projectTitle: string;
  programmingLanguage: string;
  projectStatus: string;
  weeklySummary: string;
  individualContribution: string;
  students: Student[];
}

function generatePDF(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const PW = 595.28;
    const PH = 841.89;
    const MAR = 36;
    const TW = PW - MAR * 2;

    // Define 4-column widths to match reference precisely
    const CL = 110;             // Width for Label columns (1 and 3)
    const CV = (TW / 2) - CL;   // Width for Value columns (2 and 4)
    
    // Widths for Page 2 (2nd column is the remainder)
    const C1 = 165;
    const C2 = TW - C1;

    const DARK = "#1a1a1a";
    const LGRAY = "#f0f0f0";
    const WHITE = "#ffffff";
    const BLACK = "#000000";
    const BOLD = "Helvetica-Bold";
    const NORMAL = "Helvetica";

    let y = MAR;


    // --- HEADER SECTION ---
    const headerLines = [
      { text: "Manipal University Jaipur", font: BOLD, size: 11 },
      { text: "School of Computer Science and Engineering", font: BOLD, size: 10 },
      { text: "Department of AIML", font: BOLD, size: 10 },
      { text: "Jan 2025 – May 2025", font: BOLD, size: 10 },
      { text: "B. Tech AIML (CSE), IV Semester", font: BOLD, size: 10 },
    ];

    headerLines.forEach(({ text, font, size }) => {
      doc.font(font).fontSize(size).fillColor(DARK)
        .text(text, MAR, y, { width: TW, align: "center" });
      y += size + 3;
    });

    y += 6;

    // Title banner
    const bannerH = 20;
    doc.rect(MAR, y, TW, bannerH).fillAndStroke(WHITE, BLACK);
    doc.font(BOLD).fontSize(10).fillColor(BLACK)
      .text("PBL  Weekly Progress Report – Groupwise", MAR, y + 5, { width: TW, align: "center" });
    y += bannerH;

    // --- HELPER: 4-COLUMN ROW LOGIC ---
    function drawFourColRow(l1: string, v1: string | string[], l2: string, v2: string | string[], rowH: number, yPos: number): number {
      const colX = [MAR, MAR + CL, MAR + (TW / 2), MAR + (TW / 2) + CL];
      const widths = [CL, CV, CL, CV];

      // Draw all 4 rectangles
      [0, 1, 2, 3].forEach(i => {
        const bg = (i === 0 || i === 2) ? LGRAY : WHITE;
        doc.rect(colX[i], yPos, widths[i], rowH).fillAndStroke(bg, BLACK);
      });

      // Add text to each column
      const addCellText = (text: string | string[], i: number, isBold: boolean) => {
        doc.font(isBold ? BOLD : NORMAL).fontSize(8.5).fillColor(BLACK);
        const content = Array.isArray(text) ? text.join("\n") : text;
        
        // Vertical centering logic: (RowHeight - TotalTextHeight) / 2
        const textH = doc.heightOfString(content, { width: widths[i] - 8 });
        const textY = yPos + (rowH - textH) / 2;

        doc.text(content, colX[i] + 4, textY, { width: widths[i] - 8, align: "center" });
      };

      addCellText(l1, 0, true);
      addCellText(v1, 1, false);
      addCellText(l2, 2, true);
      addCellText(v2, 3, false);

      return yPos + rowH;
    }

    // --- HELPER: PAGE 2 ROWS ---
    function drawRow(label: string, value: string, rowH: number, yPos: number): number {
      doc.rect(MAR, yPos, C1, rowH).fillAndStroke(LGRAY, BLACK);
      doc.rect(MAR + C1, yPos, C2, rowH).fillAndStroke(WHITE, BLACK);
      doc.font(BOLD).fontSize(9).fillColor(BLACK).text(label, MAR + 6, yPos + 6, { width: C1 - 12 });
      doc.font(NORMAL).fontSize(9).fillColor(BLACK).text(value, MAR + C1 + 8, yPos + 10, { width: C2 - 16 });
      return yPos + rowH;
    }

    function drawTallRow(label: string, value: string, yPos: number): number {
      const measured = doc.font(NORMAL).fontSize(9).heightOfString(value, { width: C2 - 16 });
      const rowH = Math.max(80, measured + 20);
      doc.rect(MAR, yPos, C1, rowH).fillAndStroke(LGRAY, BLACK);
      doc.rect(MAR + C1, yPos, C2, rowH).fillAndStroke(WHITE, BLACK);
      doc.font(BOLD).fontSize(9).fillColor(BLACK).text(label, MAR + 6, yPos + 6, { width: C1 - 12 });
      doc.font(NORMAL).fontSize(9).fillColor(BLACK).text(value, MAR + C1 + 8, yPos + 10, { width: C2 - 16 });
      return yPos + rowH;
    }

    // --- PAGE 1 EXECUTION ---
    const names = data.students.map(s => s.name);
    const regs = data.students.map(s => s.reg);
    const mobiles = data.students.map(s => s.mobile);
    const emails = data.students.map(s => s.email);

    const dynH = Math.max(60, data.students.length * 18);

    y = drawFourColRow("Students Name\n(Groupwise)", names, "Programme:", "B. Tech AIML (CSE)", dynH, y);
    y = drawFourColRow("Semester/\nSection", data.semesterSection, "Reg Numbers:\n(Groupwise)", regs, dynH, y);
    y = drawFourColRow("Student Mobile\nNumber", mobiles, "Course Code:", data.courseCode, dynH, y);
    y = drawFourColRow("Student Email-IDs:", emails, "Date and Week:", data.weekInfo, dynH, y);

    // --- PAGE 2 EXECUTION ---
    doc.addPage({ size: "A4", margin: 0 });
    y = MAR;

    // Add larger logo at top-left of second page
    try {
      const logoPath = path.join(process.cwd(), "logo.png");
      doc.image(logoPath, MAR, MAR, { width: 220 });
    } catch (e) {
      console.warn("Logo not found at 'logo.png'. Skipping image drawing.");
    }

    y = MAR + 80;  // Leave space below the logo for header

    headerLines.forEach(({ text, font, size }) => {
      doc.font(font).fontSize(size).fillColor(DARK).text(text, MAR, y, { width: TW, align: "center" });
      y += size + 3;
    });
    y += 10;

    y = drawRow("Name of Faculty\nSupervisor", data.facultySupervisor, 36, y);
    y = drawRow("PBL Project Title:", data.projectTitle, 36, y);
    y = drawRow("Programming\nLanguage", data.programmingLanguage, 44, y);
    y = drawRow("Project Status\n(% Completed)", data.projectStatus, 44, y);
    y = drawTallRow("Weekly Project\nProgress-Summary", data.weeklySummary, y);
    y = drawTallRow("Individual\nContribution", data.individualContribution, y);

    y += 30;
    const sigY = Math.min(y, PH - 70);
    doc.font(BOLD).fontSize(9).fillColor(BLACK);
    doc.text("Signature of Students:", MAR, sigY);
    doc.text("Signature of Supervisor:", MAR + TW - 150, sigY);
    doc.text("Date:", MAR, sigY + 16);
    doc.text("Date:", MAR + TW - 150, sigY + 16);

    doc.end();
  });
}

app.post("/generate-pdf", async (req: Request, res: Response) => {
  try {
    const data: ReportData = req.body;
    const pdfBuffer = await generatePDF(data);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="PBL_Weekly_Progress_Report.pdf"',
      "Content-Length": pdfBuffer.length.toString(),
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).send("PDF generation failed.");
  }
});

export{generatePDF};
app.listen(3000, () => console.log(`✓ Server running at http://localhost:3000`));