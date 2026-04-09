const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function asText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function buildStudents(students) {
  if (!Array.isArray(students)) {
    return [];
  }

  return students
    .map((student) => ({
      name: asText(student?.name),
      reg: asText(student?.reg),
      mobile: asText(student?.mobile),
      email: asText(student?.email),
    }))
    .filter((student) => student.name);
}

function generateWeeklyReportPdf(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 36;
    const totalWidth = pageWidth - margin * 2;

    const colLabel = 110;
    const colValue = totalWidth / 2 - colLabel;
    const page2Col1 = 165;
    const page2Col2 = totalWidth - page2Col1;

    const dark = '#1a1a1a';
    const lightGray = '#f0f0f0';
    const white = '#ffffff';
    const black = '#000000';
    const bold = 'Helvetica-Bold';
    const normal = 'Helvetica';

    let y = margin;

    const headerLines = [
      { text: 'Manipal University Jaipur', font: bold, size: 11 },
      { text: 'School of Computer Science and Engineering', font: bold, size: 10 },
      { text: 'Department of AIML', font: bold, size: 10 },
      { text: 'Jan 2025 - May 2025', font: bold, size: 10 },
      { text: 'B. Tech AIML (CSE), IV Semester', font: bold, size: 10 },
    ];

    headerLines.forEach(({ text, font, size }) => {
      doc
        .font(font)
        .fontSize(size)
        .fillColor(dark)
        .text(text, margin, y, { width: totalWidth, align: 'center' });
      y += size + 3;
    });

    y += 6;

    const bannerHeight = 20;
    doc.rect(margin, y, totalWidth, bannerHeight).fillAndStroke(white, black);
    doc
      .font(bold)
      .fontSize(10)
      .fillColor(black)
      .text('PBL Weekly Progress Report - Groupwise', margin, y + 5, {
        width: totalWidth,
        align: 'center',
      });
    y += bannerHeight;

    function drawFourColRow(label1, value1, label2, value2, rowHeight, top) {
      const colX = [margin, margin + colLabel, margin + totalWidth / 2, margin + totalWidth / 2 + colLabel];
      const widths = [colLabel, colValue, colLabel, colValue];

      [0, 1, 2, 3].forEach((index) => {
        const background = index === 0 || index === 2 ? lightGray : white;
        doc.rect(colX[index], top, widths[index], rowHeight).fillAndStroke(background, black);
      });

      const addCellText = (text, index, isBold) => {
        doc.font(isBold ? bold : normal).fontSize(8.5).fillColor(black);
        const content = Array.isArray(text) ? text.join('\n') : text;
        const textHeight = doc.heightOfString(content, { width: widths[index] - 8 });
        const textY = top + (rowHeight - textHeight) / 2;

        doc.text(content, colX[index] + 4, textY, {
          width: widths[index] - 8,
          align: 'center',
        });
      };

      addCellText(label1, 0, true);
      addCellText(value1, 1, false);
      addCellText(label2, 2, true);
      addCellText(value2, 3, false);

      return top + rowHeight;
    }

    function drawRow(label, value, rowHeight, top) {
      doc.rect(margin, top, page2Col1, rowHeight).fillAndStroke(lightGray, black);
      doc.rect(margin + page2Col1, top, page2Col2, rowHeight).fillAndStroke(white, black);
      doc.font(bold).fontSize(9).fillColor(black).text(label, margin + 6, top + 6, {
        width: page2Col1 - 12,
      });
      doc.font(normal).fontSize(9).fillColor(black).text(value, margin + page2Col1 + 8, top + 10, {
        width: page2Col2 - 16,
      });
      return top + rowHeight;
    }

    function drawTallRow(label, value, top) {
      const measured = doc.font(normal).fontSize(9).heightOfString(value, {
        width: page2Col2 - 16,
      });
      const rowHeight = Math.max(80, measured + 20);

      doc.rect(margin, top, page2Col1, rowHeight).fillAndStroke(lightGray, black);
      doc.rect(margin + page2Col1, top, page2Col2, rowHeight).fillAndStroke(white, black);
      doc.font(bold).fontSize(9).fillColor(black).text(label, margin + 6, top + 6, {
        width: page2Col1 - 12,
      });
      doc.font(normal).fontSize(9).fillColor(black).text(value, margin + page2Col1 + 8, top + 10, {
        width: page2Col2 - 16,
      });

      return top + rowHeight;
    }

    const students = buildStudents(data.students);
    const names = students.map((student) => student.name);
    const regs = students.map((student) => student.reg || '-');
    const mobiles = students.map((student) => student.mobile || '-');
    const emails = students.map((student) => student.email || '-');

    const dynamicHeight = Math.max(60, students.length * 18);

    y = drawFourColRow('Students Name\n(Groupwise)', names, 'Programme:', 'B. Tech AIML (CSE)', dynamicHeight, y);
    y = drawFourColRow('Semester/\nSection', asText(data.semesterSection, '-'), 'Reg Numbers:\n(Groupwise)', regs, dynamicHeight, y);
    y = drawFourColRow('Student Mobile\nNumber', mobiles, 'Course Code:', asText(data.courseCode, '-'), dynamicHeight, y);
    y = drawFourColRow('Student Email-IDs:', emails, 'Date and Week:', asText(data.weekInfo, '-'), dynamicHeight, y);

    doc.addPage({ size: 'A4', margin: 0 });
    y = margin;

    try {
      const logoPath = path.join(__dirname, '..', 'assets', 'report-logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, margin, margin, { width: 220 });
      }
    } catch (error) {
      // Keep PDF generation resilient if the logo is missing or unreadable.
    }

    y = margin + 80;

    headerLines.forEach(({ text, font, size }) => {
      doc
        .font(font)
        .fontSize(size)
        .fillColor(dark)
        .text(text, margin, y, { width: totalWidth, align: 'center' });
      y += size + 3;
    });
    y += 10;

    y = drawRow('Name of Faculty\nSupervisor', asText(data.facultySupervisor, '-'), 36, y);
    y = drawRow('PBL Project Title:', asText(data.projectTitle, '-'), 36, y);
    y = drawRow('Programming\nLanguage', asText(data.programmingLanguage, '-'), 44, y);
    y = drawRow('Project Status\n(% Completed)', asText(data.projectStatus, '-'), 44, y);
    y = drawTallRow('Weekly Project\nProgress-Summary', asText(data.weeklySummary, 'No summary provided.'), y);
    y = drawTallRow('Individual\nContribution', asText(data.individualContribution, 'Not provided.'), y);

    y += 30;
    const signatureY = Math.min(y, pageHeight - 70);

    doc.font(bold).fontSize(9).fillColor(black);
    doc.text('Signature of Students:', margin, signatureY);
    doc.text('Signature of Supervisor:', margin + totalWidth - 150, signatureY);
    doc.text('Date:', margin, signatureY + 16);
    doc.text('Date:', margin + totalWidth - 150, signatureY + 16);

    doc.end();
  });
}

module.exports = {
  generateWeeklyReportPdf,
};
