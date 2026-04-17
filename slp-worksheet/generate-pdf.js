const { PDFDocument, StandardFonts, rgb, PageSizes } = require("pdf-lib");
const fs = require("fs");

// ─── Colour helpers ───────────────────────────────────────────────
const hex = (h) => {
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    return rgb(r, g, b);
};

const C = {
    navy: hex("1B2A4A"),
    teal: hex("2A7B88"),
    gold: hex("D4A843"),
    slate: hex("4A5568"),
    light: hex("F0F4F8"),
    white: hex("FFFFFF"),
    black: hex("1A1A2E"),
    midGray: hex("E2E8F0"),
    accent: hex("E8F4F8"),
    lineGray: hex("CBD5E0"),
    goldBg: hex("FFF9E6"),
};

(async () => {
    const pdf = await PDFDocument.create();
    const fontR = await pdf.embedFont(StandardFonts.Helvetica);
    const fontB = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontI = await pdf.embedFont(StandardFonts.HelveticaOblique);
    const fontSerif = await pdf.embedFont(StandardFonts.TimesRomanBold);

    const W = PageSizes.A4[0]; // 595
    const H = PageSizes.A4[1]; // 842
    const MARGIN = 50;
    const CONTENT_W = W - 2 * MARGIN;

    let page, y;

    function newPage() {
        page = pdf.addPage(PageSizes.A4);
        y = H - 40;
        // Header
        page.drawText("SLP Infographic Planning Worksheet", {
            x: W - MARGIN - fontI.widthOfTextAtSize("SLP Infographic Planning Worksheet", 8),
            y: H - 25,
            size: 8,
            font: fontI,
            color: C.slate,
        });
        y = H - 55;
        return page;
    }

    function checkSpace(needed) {
        if (y - needed < 50) {
            // Page number on current page
            addPageNumber();
            newPage();
        }
    }

    let pageCount = 0;
    function addPageNumber() {
        pageCount++;
        const pages = pdf.getPages();
        const p = pages[pages.length - 1];
        const text = `Page ${pageCount}`;
        p.drawText(text, {
            x: (W - fontR.widthOfTextAtSize(text, 8)) / 2,
            y: 20,
            size: 8,
            font: fontR,
            color: C.slate,
        });
    }

    // ─── Drawing helpers ──────────────────────────────────────────

    function drawBanner() {
        const bannerH = 65;
        page.drawRectangle({
            x: MARGIN, y: y - bannerH,
            width: CONTENT_W, height: bannerH,
            color: C.navy,
        });
        // Gold underline
        page.drawRectangle({
            x: MARGIN, y: y - bannerH - 3,
            width: CONTENT_W, height: 3,
            color: C.gold,
        });

        const title1 = "Service-Learning Infographic";
        const title2 = "PLANNING WORKSHEET";
        const t1w = fontSerif.widthOfTextAtSize(title1, 18);
        const t2w = fontB.widthOfTextAtSize(title2, 12);

        page.drawText(title1, {
            x: MARGIN + (CONTENT_W - t1w) / 2,
            y: y - 30,
            size: 18,
            font: fontSerif,
            color: C.white,
        });
        page.drawText(title2, {
            x: MARGIN + (CONTENT_W - t2w) / 2,
            y: y - 52,
            size: 12,
            font: fontB,
            color: C.gold,
        });
        y -= bannerH + 20;
    }

    function drawBox(text, bgColor, borderColor, fontSize = 10) {
        const lines = wrapText(text, fontR, fontSize, CONTENT_W - 30);
        const boxH = lines.length * (fontSize + 4) + 16;
        checkSpace(boxH + 10);
        page.drawRectangle({ x: MARGIN, y: y - boxH, width: CONTENT_W, height: boxH, color: bgColor });
        page.drawRectangle({ x: MARGIN, y: y - boxH, width: 4, height: boxH, color: borderColor });
        let ty = y - 12;
        for (const line of lines) {
            page.drawText(line, { x: MARGIN + 15, y: ty, size: fontSize, font: fontR, color: C.slate });
            ty -= fontSize + 4;
        }
        y -= boxH + 8;
    }

    function drawPurpose(text) {
        const label = "Purpose: ";
        const lw = fontB.widthOfTextAtSize(label, 10);
        const remaining = wrapText(text, fontR, 10, CONTENT_W - 30 - lw);
        const boxH = Math.max(remaining.length, 1) * 14 + 16;
        checkSpace(boxH + 10);
        page.drawRectangle({ x: MARGIN, y: y - boxH, width: CONTENT_W, height: boxH, color: C.accent });
        page.drawRectangle({ x: MARGIN, y: y - boxH, width: 4, height: boxH, color: C.teal });

        page.drawText(label, { x: MARGIN + 15, y: y - 14, size: 10, font: fontB, color: C.teal });
        let ty = y - 14;
        for (let i = 0; i < remaining.length; i++) {
            const xOff = i === 0 ? lw : 0;
            page.drawText(remaining[i], { x: MARGIN + 15 + xOff, y: ty, size: 10, font: fontR, color: C.slate });
            ty -= 14;
        }
        y -= boxH + 8;
    }

    function drawSectionTitle(num, text) {
        checkSpace(40);
        y -= 10;
        const numText = `INFOGRAPHIC ${num}`;
        page.drawText(numText, { x: MARGIN, y: y, size: 9, font: fontB, color: C.teal });
        const nw = fontB.widthOfTextAtSize(numText, 9);
        page.drawText(`  -  ${text}`, { x: MARGIN + nw, y: y, size: 14, font: fontSerif, color: C.navy });
        y -= 6;
        page.drawLine({
            start: { x: MARGIN, y: y },
            end: { x: W - MARGIN, y: y },
            thickness: 1.5,
            color: C.teal,
        });
        y -= 14;
    }

    function drawSubheading(text) {
        checkSpace(25);
        y -= 6;
        page.drawText(text, { x: MARGIN, y: y, size: 11, font: fontB, color: C.navy });
        y -= 18;
    }

    function drawQuestion(label) {
        checkSpace(22);
        const lw = fontR.widthOfTextAtSize(label + " ", 10);
        page.drawText(label, { x: MARGIN + 5, y: y, size: 10, font: fontR, color: C.black });
        page.drawLine({
            start: { x: MARGIN + 5 + lw, y: y - 2 },
            end: { x: W - MARGIN, y: y - 2 },
            thickness: 0.5,
            color: C.lineGray,
        });
        y -= 22;
    }

    function drawNumberedLine(n, paren = false) {
        checkSpace(22);
        const label = paren ? `(${n})` : `${n}.`;
        page.drawText(label, { x: MARGIN + 5, y: y, size: 10, font: fontB, color: paren ? C.slate : C.teal });
        const lw = fontB.widthOfTextAtSize(label + "  ", 10);
        page.drawLine({
            start: { x: MARGIN + 5 + lw, y: y - 2 },
            end: { x: W - MARGIN, y: y - 2 },
            thickness: 0.5,
            color: C.lineGray,
        });
        y -= 22;
    }

    function drawBullet(text, subText) {
        checkSpace(subText ? 30 : 18);
        page.drawCircle({ x: MARGIN + 18, y: y + 3, size: 2, color: C.teal });
        page.drawText(text, { x: MARGIN + 28, y: y, size: 10, font: fontR, color: C.black });
        y -= 14;
        if (subText) {
            page.drawText(subText, { x: MARGIN + 28, y: y, size: 8, font: fontI, color: C.slate });
            y -= 12;
        }
    }

    function drawDivider() {
        checkSpace(20);
        y -= 8;
        page.drawLine({
            start: { x: MARGIN + 30, y: y },
            end: { x: W - MARGIN - 30, y: y },
            thickness: 0.5,
            color: C.midGray,
        });
        y -= 12;
    }

    function drawWritingLines(count) {
        for (let i = 0; i < count; i++) {
            checkSpace(20);
            page.drawLine({
                start: { x: MARGIN + 5, y: y },
                end: { x: W - MARGIN, y: y },
                thickness: 0.5,
                color: C.lineGray,
            });
            y -= 20;
        }
    }

    function wrapText(text, font, size, maxWidth) {
        const words = text.split(" ");
        const lines = [];
        let current = "";
        for (const word of words) {
            const test = current ? current + " " + word : word;
            if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
                lines.push(current);
                current = word;
            } else {
                current = test;
            }
        }
        if (current) lines.push(current);
        return lines;
    }

    function space(px = 8) { y -= px; }

    // ═══════════════════ BUILD PDF ═══════════════════════════════════

    newPage();
    drawBanner();

    // Product box
    drawBox(
        "Product:  You will create 3 x A3 infographic posters that visually communicate your SLP learning.",
        C.light, C.navy
    );

    // Required content as two-column bullets
    drawSubheading("Required Content for All Infographics:");
    const leftItems = ["Project title", "Your name + school email", "Partner(s)", "Project goals"];
    const rightItems = ["Why you chose this project (interest / motivation)", "Sans Serif for all body text", "Traditional Serif for titles/subtitles"];

    for (let i = 0; i < Math.max(leftItems.length, rightItems.length); i++) {
        checkSpace(16);
        if (i < leftItems.length) {
            page.drawCircle({ x: MARGIN + 18, y: y + 3, size: 2, color: C.teal });
            page.drawText(leftItems[i], { x: MARGIN + 28, y: y, size: 9, font: fontR, color: C.black });
        }
        if (i < rightItems.length) {
            page.drawCircle({ x: W / 2 + 13, y: y + 3, size: 2, color: C.teal });
            const wrapped = wrapText(rightItems[i], fontR, 9, CONTENT_W / 2 - 30);
            for (let j = 0; j < wrapped.length; j++) {
                page.drawText(wrapped[j], { x: W / 2 + 23, y: y - j * 12, size: 9, font: fontR, color: C.black });
            }
        }
        y -= 16;
    }

    space(6);

    // Deadline box
    const dlH = 40;
    checkSpace(dlH + 10);
    page.drawRectangle({ x: MARGIN, y: y - dlH, width: CONTENT_W, height: dlH, color: C.goldBg });
    page.drawRectangle({ x: MARGIN, y: y - dlH, width: 4, height: dlH, color: C.gold });
    page.drawText("Deadline:", { x: MARGIN + 15, y: y - 14, size: 10, font: fontB, color: C.navy });
    page.drawText("  19-24 March", { x: MARGIN + 75, y: y - 14, size: 12, font: fontB, color: C.gold });
    page.drawText("Upload onto Schoology AND print TWO sets of your complete A3 color infographic posters (~6+ pages)", {
        x: MARGIN + 15, y: y - 32, size: 8, font: fontR, color: C.slate,
    });
    y -= dlH + 12;

    drawDivider();

    // ═══════ INFOGRAPHIC 1 ═══════
    drawSectionTitle(1, "My Impact");
    drawPurpose("Show the real impact of your project using clear, honest data.");

    space(4);
    drawQuestion("What methods did you use to measure impact?");
    drawQuestion("What did you measure?");
    drawQuestion("How did you measure it?");
    drawQuestion("Why does this measurement matter?");

    space(4);
    drawSubheading("Three pieces of data:");
    drawNumberedLine(1);
    drawNumberedLine(2);
    drawNumberedLine(3);

    space(4);
    drawQuestion("What changed?");
    drawQuestion("Who benefited?");
    drawQuestion("What evidence proves your impact?");

    drawDivider();

    // ═══════ INFOGRAPHIC 2 ═══════
    drawSectionTitle(2, "My Process - Required Thinking");

    drawBox(
        "Don't just describe what you did - explain why you did it this way. Be authentic. Show the real decisions, changes, challenges, or surprises. Include a reflective perspective: What did you learn from each step? How did your thinking evolve?",
        C.accent, C.teal, 9
    );

    space(4);
    drawSubheading("List 5 images or graphics you will include:");
    for (let i = 1; i <= 5; i++) drawNumberedLine(i);

    space(4);
    drawSubheading("Write a 1-2 sentence caption for each image:");
    for (let i = 1; i <= 5; i++) drawNumberedLine(i);

    space(4);
    drawSubheading("Two quotes:");
    drawQuestion("Quote 1:");
    drawQuestion("Quote 2:");

    space(4);
    drawSubheading("Challenges, surprises, and what you learned:");
    drawWritingLines(3);

    drawDivider();

    // ═══════ INFOGRAPHIC 3 ═══════
    drawSectionTitle(3, "My Growth");

    drawSubheading("Considerations");
    drawBox(
        "Project management  /  Collaboration  /  Subject/content understanding  /  TTGs  /  Skills (communication, empathy, leadership, problem-solving)  /  Mistakes: what you learned  /  Unexpected challenges: how you adapted  /  And more",
        C.light, C.navy, 9
    );

    space(4);
    drawSubheading("List 5 reflections on your growth:");
    for (let i = 1; i <= 5; i++) drawNumberedLine(i);

    space(4);
    drawSubheading("Bonus reflections (optional):");
    for (let i = 6; i <= 10; i++) drawNumberedLine(i, true);

    space(4);
    drawQuestion("Your key takeaway (headline):");

    space(8);
    const photoH = 30;
    checkSpace(photoH + 10);
    page.drawRectangle({ x: MARGIN, y: y - photoH, width: CONTENT_W, height: photoH, color: C.light });
    const phText = "Insert a photo or avatar of you later.";
    const phW = fontI.widthOfTextAtSize(phText, 9);
    page.drawText(phText, {
        x: MARGIN + (CONTENT_W - phW) / 2,
        y: y - 20,
        size: 9,
        font: fontI,
        color: C.slate,
    });
    y -= photoH + 5;

    // Final page number
    addPageNumber();

    // ─── Save ────────────────────────────────────────────────────
    const bytes = await pdf.save();
    const outPath = __dirname + "/SLP_Infographic_Planning_Worksheet.pdf";
    fs.writeFileSync(outPath, bytes);
    console.log("✅  PDF created:", outPath);
})();
