const docx = require("docx");
const fs = require("fs");

const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    WidthType, AlignmentType, BorderStyle, HeadingLevel,
    ShadingType, PageBreak, TabStopPosition, TabStopType,
    Header, Footer, PageNumber, NumberFormat,
    TableLayoutType, VerticalAlign, convertInchesToTwip
} = docx;

// ─── Color palette ────────────────────────────────────────────────
const C = {
    navy: "1B2A4A",
    teal: "2A7B88",
    gold: "D4A843",
    slate: "4A5568",
    light: "F0F4F8",
    white: "FFFFFF",
    black: "1A1A2E",
    midGray: "E2E8F0",
    accent: "E8F4F8",
};

// ─── Reusable helpers ─────────────────────────────────────────────

function sectionTitle(text, num) {
    return new Paragraph({
        spacing: { before: 400, after: 100 },
        border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: C.teal },
        },
        children: [
            new TextRun({
                text: `INFOGRAPHIC ${num}`,
                font: "Helvetica",
                size: 18,
                color: C.teal,
                bold: true,
            }),
            new TextRun({
                text: `  —  ${text}`,
                font: "Georgia",
                size: 26,
                color: C.navy,
                bold: true,
            }),
        ],
    });
}

function purposeBox(text) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        shading: { type: ShadingType.SOLID, color: C.accent },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1, color: C.teal },
                            bottom: { style: BorderStyle.SINGLE, size: 1, color: C.teal },
                            left: { style: BorderStyle.SINGLE, size: 8, color: C.teal },
                            right: { style: BorderStyle.SINGLE, size: 1, color: C.teal },
                        },
                        margins: {
                            top: convertInchesToTwip(0.1),
                            bottom: convertInchesToTwip(0.1),
                            left: convertInchesToTwip(0.15),
                            right: convertInchesToTwip(0.15),
                        },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "Purpose: ", font: "Helvetica", size: 20, bold: true, color: C.teal }),
                                    new TextRun({ text, font: "Helvetica", size: 20, color: C.slate }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ],
    });
}

function questionLine(label) {
    return new Paragraph({
        spacing: { before: 160, after: 60 },
        children: [
            new TextRun({ text: label + " ", font: "Helvetica", size: 20, color: C.black }),
            new TextRun({ text: "________________________________________", font: "Helvetica", size: 20, color: C.midGray }),
        ],
    });
}

function numberedLine(n) {
    return new Paragraph({
        spacing: { before: 120, after: 60 },
        children: [
            new TextRun({ text: `${n}. `, font: "Helvetica", size: 20, bold: true, color: C.teal }),
            new TextRun({ text: "_____________________________________________", font: "Helvetica", size: 20, color: C.midGray }),
        ],
    });
}

function parenNumberedLine(n) {
    return new Paragraph({
        spacing: { before: 120, after: 60 },
        children: [
            new TextRun({ text: `(${n}) `, font: "Helvetica", size: 20, color: C.slate }),
            new TextRun({ text: "_____________________________________________", font: "Helvetica", size: 20, color: C.midGray }),
        ],
    });
}

function subheading(text) {
    return new Paragraph({
        spacing: { before: 280, after: 80 },
        children: [
            new TextRun({ text, font: "Helvetica", size: 21, bold: true, color: C.navy }),
        ],
    });
}

function bodyText(text, opts = {}) {
    return new Paragraph({
        spacing: { before: opts.spaceBefore || 80, after: opts.spaceAfter || 60 },
        children: [
            new TextRun({ text, font: "Helvetica", size: 20, color: C.slate, italics: opts.italic || false }),
        ],
    });
}

function bulletItem(text, subText) {
    const children = [
        new TextRun({ text: "•  ", font: "Helvetica", size: 20, color: C.teal }),
        new TextRun({ text, font: "Helvetica", size: 20, color: C.black }),
    ];
    if (subText) {
        children.push(new TextRun({ text: `\n     ${subText}`, font: "Helvetica", size: 18, color: C.slate, italics: true }));
    }
    return new Paragraph({
        spacing: { before: 60, after: 40 },
        indent: { left: convertInchesToTwip(0.3) },
        children,
    });
}

function blank() {
    return new Paragraph({ spacing: { before: 60, after: 60 }, children: [] });
}

function divider() {
    return new Paragraph({
        spacing: { before: 200, after: 200 },
        border: {
            bottom: { style: BorderStyle.SINGLE, size: 2, color: C.midGray },
        },
        children: [],
    });
}

function writingArea(lines = 3) {
    const rows = [];
    for (let i = 0; i < lines; i++) {
        rows.push(
            new Paragraph({
                spacing: { before: 40, after: 40 },
                border: {
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: C.midGray },
                },
                children: [new TextRun({ text: " ", font: "Helvetica", size: 22 })],
            })
        );
    }
    return rows;
}

// ─── Build Document ───────────────────────────────────────────────

const doc = new Document({
    styles: {
        default: {
            document: {
                run: { font: "Helvetica", size: 20, color: C.black },
            },
        },
    },
    sections: [
        {
            properties: {
                page: {
                    margin: {
                        top: convertInchesToTwip(0.7),
                        bottom: convertInchesToTwip(0.7),
                        left: convertInchesToTwip(0.85),
                        right: convertInchesToTwip(0.85),
                    },
                },
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                                new TextRun({ text: "SLP Infographic Planning Worksheet", font: "Helvetica", size: 16, color: C.slate, italics: true }),
                            ],
                        }),
                    ],
                }),
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({ text: "Page ", font: "Helvetica", size: 16, color: C.slate }),
                                new TextRun({ children: [PageNumber.CURRENT], font: "Helvetica", size: 16, color: C.slate }),
                            ],
                        }),
                    ],
                }),
            },
            children: [
                // ═══════════════ TITLE BANNER ═══════════════
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    shading: { type: ShadingType.SOLID, color: C.navy },
                                    margins: {
                                        top: convertInchesToTwip(0.2),
                                        bottom: convertInchesToTwip(0.2),
                                        left: convertInchesToTwip(0.3),
                                        right: convertInchesToTwip(0.3),
                                    },
                                    borders: {
                                        top: { style: BorderStyle.NONE },
                                        bottom: { style: BorderStyle.SINGLE, size: 8, color: C.gold },
                                        left: { style: BorderStyle.NONE },
                                        right: { style: BorderStyle.NONE },
                                    },
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.CENTER,
                                            children: [
                                                new TextRun({
                                                    text: "Service-Learning Infographic",
                                                    font: "Georgia",
                                                    size: 34,
                                                    bold: true,
                                                    color: C.white,
                                                }),
                                            ],
                                        }),
                                        new Paragraph({
                                            alignment: AlignmentType.CENTER,
                                            children: [
                                                new TextRun({
                                                    text: "PLANNING WORKSHEET",
                                                    font: "Helvetica",
                                                    size: 24,
                                                    color: C.gold,
                                                    characterSpacing: 200,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),

                blank(),

                // ═══════════════ PRODUCT SECTION ═══════════════
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    shading: { type: ShadingType.SOLID, color: C.light },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: C.midGray },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: C.midGray },
                                        left: { style: BorderStyle.SINGLE, size: 6, color: C.navy },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: C.midGray },
                                    },
                                    margins: {
                                        top: convertInchesToTwip(0.12),
                                        bottom: convertInchesToTwip(0.12),
                                        left: convertInchesToTwip(0.15),
                                        right: convertInchesToTwip(0.15),
                                    },
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new TextRun({ text: "Product: ", font: "Helvetica", size: 20, bold: true, color: C.navy }),
                                                new TextRun({ text: "You will create ", font: "Helvetica", size: 20, color: C.black }),
                                                new TextRun({ text: "3 × A3 infographic posters", font: "Helvetica", size: 20, bold: true, color: C.teal, underline: {} }),
                                                new TextRun({ text: " that visually communicate your SLP learning.", font: "Helvetica", size: 20, color: C.black }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),

                blank(),

                // ═══════════════ REQUIRED CONTENT ═══════════════
                subheading("Required Content for All Infographics:"),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.SINGLE, size: 1, color: C.midGray } },
                                    children: [
                                        bulletItem("Project title"),
                                        bulletItem("Your name + school email"),
                                        bulletItem("Partner(s)"),
                                        bulletItem("Project goals"),
                                    ],
                                }),
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                                    margins: { left: convertInchesToTwip(0.2) },
                                    children: [
                                        bulletItem("Why you chose this project (interest / motivation)"),
                                        bulletItem("Sans Serif for all body text"),
                                        bulletItem("Traditional Serif for titles/subtitles"),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),

                blank(),

                // ═══════════════ DEADLINE ═══════════════
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    shading: { type: ShadingType.SOLID, color: "FFF9E6" },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 2, color: C.gold },
                                        bottom: { style: BorderStyle.SINGLE, size: 2, color: C.gold },
                                        left: { style: BorderStyle.SINGLE, size: 6, color: C.gold },
                                        right: { style: BorderStyle.SINGLE, size: 2, color: C.gold },
                                    },
                                    margins: {
                                        top: convertInchesToTwip(0.08),
                                        bottom: convertInchesToTwip(0.08),
                                        left: convertInchesToTwip(0.15),
                                        right: convertInchesToTwip(0.15),
                                    },
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new TextRun({ text: "📅  Deadline: ", font: "Helvetica", size: 20, bold: true, color: C.navy }),
                                                new TextRun({ text: "19–24 March", font: "Helvetica", size: 22, bold: true, color: C.gold }),
                                            ],
                                        }),
                                        new Paragraph({
                                            spacing: { before: 40 },
                                            children: [
                                                new TextRun({
                                                    text: "Upload onto Schoology AND print TWO sets of your complete A3 color infographic posters (~6+ pages)",
                                                    font: "Helvetica", size: 18, color: C.slate,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),

                blank(),
                divider(),

                // ════════════════════════════════════════════════════════════
                //  INFOGRAPHIC 1 – MY IMPACT
                // ════════════════════════════════════════════════════════════
                sectionTitle("My Impact", 1),
                purposeBox("Show the real impact of your project using clear, honest data."),

                blank(),
                questionLine("What methods did you use to measure impact?"),
                questionLine("What did you measure?"),
                questionLine("How did you measure it?"),
                questionLine("Why does this measurement matter?"),

                blank(),
                subheading("Three pieces of data:"),
                numberedLine(1),
                numberedLine(2),
                numberedLine(3),

                blank(),
                questionLine("What changed?"),
                questionLine("Who benefited?"),
                questionLine("What evidence proves your impact?"),

                divider(),

                // ════════════════════════════════════════════════════════════
                //  INFOGRAPHIC 2 – MY PROCESS / REQUIRED THINKING
                // ════════════════════════════════════════════════════════════
                sectionTitle("My Process — Required Thinking", 2),

                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    shading: { type: ShadingType.SOLID, color: C.accent },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: C.teal },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: C.teal },
                                        left: { style: BorderStyle.SINGLE, size: 8, color: C.teal },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: C.teal },
                                    },
                                    margins: {
                                        top: convertInchesToTwip(0.1),
                                        bottom: convertInchesToTwip(0.1),
                                        left: convertInchesToTwip(0.15),
                                        right: convertInchesToTwip(0.15),
                                    },
                                    children: [
                                        bulletItem("Don't just describe what you did — explain why you did it this way.", "(What was your reasoning? What choices did you make and why?)"),
                                        bulletItem("Be authentic. Show the real decisions, changes, challenges, or surprises."),
                                        bulletItem("Include a reflective perspective.", "What did you learn from each step? How did your thinking evolve? How did your actions affect the outcome?"),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),

                blank(),
                subheading("List 5 images or graphics you will include:"),
                numberedLine(1),
                numberedLine(2),
                numberedLine(3),
                numberedLine(4),
                numberedLine(5),

                blank(),
                subheading("Write a 1–2 sentence caption for each image:"),
                numberedLine(1),
                numberedLine(2),
                numberedLine(3),
                numberedLine(4),
                numberedLine(5),

                blank(),
                subheading("Two quotes:"),
                questionLine("Quote 1:"),
                questionLine("Quote 2:"),

                blank(),
                subheading("Challenges, surprises, and what you learned:"),
                ...writingArea(3),

                divider(),

                // ════════════════════════════════════════════════════════════
                //  INFOGRAPHIC 3 – MY GROWTH
                // ════════════════════════════════════════════════════════════
                sectionTitle("My Growth", 3),

                subheading("Considerations"),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    shading: { type: ShadingType.SOLID, color: C.light },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: C.midGray },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: C.midGray },
                                        left: { style: BorderStyle.SINGLE, size: 6, color: C.navy },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: C.midGray },
                                    },
                                    margins: {
                                        top: convertInchesToTwip(0.08),
                                        bottom: convertInchesToTwip(0.08),
                                        left: convertInchesToTwip(0.15),
                                        right: convertInchesToTwip(0.15),
                                    },
                                    children: [
                                        bulletItem("Project management"),
                                        bulletItem("Collaboration"),
                                        bulletItem("Subject/content understanding"),
                                        bulletItem("TTGs"),
                                        bulletItem("Skills (communication, empathy, leadership, problem-solving)"),
                                        bulletItem("Mistakes → what you learned"),
                                        bulletItem("Unexpected challenges → how you adapted"),
                                        bulletItem("And more"),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),

                blank(),
                subheading("List 5 reflections on your growth:"),
                numberedLine(1),
                numberedLine(2),
                numberedLine(3),
                numberedLine(4),
                numberedLine(5),

                blank(),
                subheading("Bonus reflections (optional):"),
                parenNumberedLine(6),
                parenNumberedLine(7),
                parenNumberedLine(8),
                parenNumberedLine(9),
                parenNumberedLine(10),

                blank(),
                questionLine("Your key takeaway (headline):"),

                blank(),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    shading: { type: ShadingType.SOLID, color: C.light },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 2, color: C.midGray },
                                        bottom: { style: BorderStyle.SINGLE, size: 2, color: C.midGray },
                                        left: { style: BorderStyle.SINGLE, size: 2, color: C.midGray },
                                        right: { style: BorderStyle.SINGLE, size: 2, color: C.midGray },
                                    },
                                    margins: {
                                        top: convertInchesToTwip(0.1),
                                        bottom: convertInchesToTwip(0.1),
                                        left: convertInchesToTwip(0.15),
                                        right: convertInchesToTwip(0.15),
                                    },
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.CENTER,
                                            children: [
                                                new TextRun({ text: "📸  Insert a photo or avatar of you later.", font: "Helvetica", size: 20, color: C.slate, italics: true }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),

            ],
        },
    ],
});

(async () => {
    const buffer = await Packer.toBuffer(doc);
    const outPath = __dirname + "/SLP_Infographic_Planning_Worksheet.docx";
    fs.writeFileSync(outPath, buffer);
    console.log("✅  Word doc created:", outPath);
})();
