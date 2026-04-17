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
    purple:   hex("6438B0"),
    navy:     hex("1A1821"),
    slate:    hex("6E6A78"),
    text:     hex("2D2B33"),
    light:    hex("F0EEF5"),
    white:    hex("FFFFFF"),
    green:    hex("1A8A5A"),
    greenBg:  hex("EEF8F3"),
    border:   hex("E2DFE8"),
    line:     hex("D0CDD8"),
};

// ─── Drill data (expanded stimulus ~180-220 words each) ──────────
const drills = [
    {
        num: 1,
        title: "Green Hydrogen and Contested Territories",
        stimulus: `Morocco has positioned itself as a global leader in renewable energy, with plans to produce 52% of its electricity from renewables by 2030. A key component of this strategy involves the development of large-scale green hydrogen projects in the southern provinces, including areas classified by the United Nations as the Non-Self-Governing Territory of Western Sahara. European energy companies have signed preliminary agreements worth over $12 billion, despite a 2024 ruling by the EU Court of Justice stating that trade agreements with Morocco cannot legally apply to Western Sahara without the consent of the Sahrawi people. The Polisario Front has called these agreements "a continuation of colonial resource extraction under a green label." Morocco's state energy agency, MASEN, disputes this characterisation, arguing that development projects benefit all residents of the southern provinces. However, independent monitors have noted that Sahrawi communities have received minimal employment or revenue-sharing from existing solar installations. The African Union, which recognises the Sahrawi Arab Democratic Republic as a member state, has remained largely silent on the issue, raising questions about the coherence of continental governance when member states' economic interests conflict with self-determination claims.`,
        source: "Adapted from multiple sources, March 2025"
    },
    {
        num: 2,
        title: "Mining Concessions and Indigenous Displacement",
        stimulus: `An investigation by Mongabay in January 2025 revealed that 13 mining concessions covering 6,600 km\u00B2 of indigenous Miskito and Mayangna territory in Nicaragua were granted to Chinese-owned companies in just 190 days, without any documented consultation with affected communities. The concessions overlap protected biosphere reserves and UNESCO-recognised indigenous homelands. Nicaragua's government has simultaneously expelled over 3,000 civil society organisations since 2018, eliminating the independent monitoring capacity that could verify environmental and human rights compliance. Gold extracted from these concessions enters global supply chains through intermediary refiners in Dubai and Switzerland, making it nearly impossible for end consumers to trace the origin of the metal. The London Bullion Market Association's responsible sourcing guidance requires refiners to demonstrate due diligence, but enforcement relies on self-reporting and voluntary audits. Indigenous Miskito leaders have appealed to the Inter-American Commission on Human Rights, citing Nicaragua's failure to uphold its obligations under ILO Convention 169, which requires free, prior and informed consent for development on indigenous lands. Nicaragua withdrew from the OAS in 2023, complicating jurisdictional enforcement of any ruling.`,
        source: "Adapted from Mongabay investigative report, January 2025"
    },
    {
        num: 3,
        title: "Security Intervention and Accountability in Haiti",
        stimulus: `Kenya's President Ruto addressed the UN Security Council in February 2025, claiming "transformative gains" from the Multinational Security Support mission in Haiti. However, data from the UN Office for the Coordination of Humanitarian Affairs tells a different story: over 5,600 people were killed in gang violence in 2024, a 23% increase from the previous year. Armed groups now control approximately 80% of Port-au-Prince, including critical infrastructure such as the national port and main highway corridors. Haitian civil society groups have drawn parallels to MINUSTAH (2004 to 2017), whose cholera epidemic killed over 10,000 Haitians and whose personnel were implicated in widespread sexual exploitation. The current MSS mission operates without a formal UN Chapter VII mandate, relying instead on bilateral agreements that lack the accountability mechanisms of traditional peacekeeping operations. Haiti's Transitional Presidential Council has limited democratic legitimacy, having been appointed through a process brokered by CARICOM rather than through elections. Critics argue that external security interventions consistently fail because they address symptoms of instability while leaving untouched the structural economic inequalities and governance deficits that sustain armed groups.`,
        source: "Adapted from OCHA and BBC reports, February 2025"
    },
    {
        num: 4,
        title: "Transboundary Water and Glacial Retreat",
        stimulus: `Central Asian glaciers feeding the Syr Darya river system have retreated by approximately 30% since 1990, fundamentally undermining the Soviet-era water allocation agreements that still govern distribution among Kazakhstan, Kyrgyzstan, and Uzbekistan. A 2025 trilateral protocol signed in Astana expressed political commitment to cooperative management, but provided no scientific mechanism for adjusting allocations to match declining flows. Uzbekistan, the basin's largest consumer at 3.347 billion cubic metres annually, has resisted external monitoring of its irrigation practices, while downstream Kazakhstan reports that its allocated share increasingly fails to reach the Northern Aral Sea, threatening the $85 million Kok-Aral Dam restoration project funded by the World Bank. Kyrgyzstan, which controls the upstream Toktogul Reservoir, has used seasonal water releases as leverage in energy negotiations, sometimes withholding flows during the summer growing season to generate hydroelectric power for winter domestic use. The UN Watercourses Convention, which entered into force in 2014, provides a framework for equitable utilisation, but none of the three riparian states have ratified it. Climate projections suggest that by 2050, glacial meltwater contribution to the Syr Darya will decline by an additional 40%, compressing the timeline for achieving a binding allocation mechanism.`,
        source: "Adapted from ICWC reports and Reuters, 2025"
    },
    {
        num: 5,
        title: "AI Governance and the Global South",
        stimulus: `The European Union's AI Act, which entered full enforcement in February 2025, establishes the world's most comprehensive regulatory framework for artificial intelligence. However, the Act's compliance costs, estimated at $300,000 to $500,000 per system for "high-risk" classification, effectively exclude AI developers in the Global South from the EU market. African Union Digital Transformation Strategy coordinator Dr. Amina Mohammed warned that "the AI Act creates a two-tier global digital economy where only wealthy nations can afford to participate in rule-making." Meanwhile, 64% of the training data used by leading AI models is sourced from English-language internet content, systematically underrepresenting the 2,000+ languages spoken across Africa and South Asia. This linguistic imbalance has measurable consequences: a 2024 Stanford study found that AI diagnostic tools trained primarily on English-language medical literature misidentified symptoms described in non-Western cultural frameworks at rates 3.4 times higher than for English-speaking patients. The UNESCO Recommendation on the Ethics of AI, adopted in 2021, calls for inclusive development, but provides no enforcement mechanism. India and Brazil have proposed alternative regulatory models at the G20, arguing that AI governance must reflect diverse development contexts rather than importing frameworks designed for post-industrial economies.`,
        source: "Adapted from EU Commission briefing and AU Digital Strategy review, 2025"
    },
    {
        num: 6,
        title: "Antimicrobial Resistance and Pharmaceutical Access",
        stimulus: `The WHO's 2024 Global Report on Antimicrobial Resistance estimated that drug-resistant infections killed 1.27 million people directly in 2023, with 4.95 million deaths associated with resistance. Sub-Saharan Africa bore the highest burden, yet only 4 of the 54 African nations have functioning national AMR surveillance systems. Pharmaceutical companies have largely abandoned antibiotic research because new antibiotics generate far less revenue than chronic disease drugs; only 2 of the 12 antibiotics approved since 2017 came from major pharmaceutical firms. The TRIPS Agreement allows compulsory licensing in health emergencies, but only 3 countries have successfully used this provision for antibiotics, citing legal complexity and fear of trade retaliation from patent-holding nations. The WHO's Global Action Plan on AMR, adopted in 2015, called for national action plans within two years, but a decade later, fewer than half of member states have fully funded plans. Agricultural use of antibiotics, which accounts for approximately 73% of global antibiotic consumption, remains largely unregulated in most developing countries. A proposed UNITAID antibiotic subscription model, which would pay pharmaceutical companies a fixed annual fee regardless of sales volume, has attracted interest from the UK and Sweden but has struggled to gain traction among governments facing competing health priorities.`,
        source: "Adapted from WHO AMR Global Report and The Lancet, 2024"
    },
    {
        num: 7,
        title: "Deep-Sea Mining and the Common Heritage of Mankind",
        stimulus: `The International Seabed Authority (ISA) is under pressure to finalise regulations for commercial deep-sea mining in the Clarion-Clipperton Zone of the Pacific Ocean, where polymetallic nodules contain cobalt, nickel, and manganese critical for electric vehicle batteries. The Metals Company, a Canadian firm, has applied for the first commercial extraction licence. Over 30 nations, including France, Germany, and several Pacific Island states, have called for a moratorium, citing insufficient scientific understanding of deep-sea ecosystems. Marine biologists warn that nodule extraction destroys habitats that take millions of years to form. Meanwhile, the Democratic Republic of Congo, which currently supplies 70% of the world's cobalt through artisanal mining linked to child labour, argues that deep-sea alternatives could undercut its primary export revenue without providing alternative livelihoods. Under the UN Convention on the Law of the Sea, the international seabed is designated as the "common heritage of mankind," meaning extraction profits are theoretically shared among all nations. However, the ISA's current revenue-sharing formula has been criticised by landlocked developing states as disproportionately favouring mining companies and their sponsoring states. Environmental groups have drawn comparisons to early deforestation governance, warning that establishing a regulatory framework only after extraction begins would repeat historical mistakes.`,
        source: "Adapted from ISA proceedings and Nature journal, 2025"
    },
    {
        num: 8,
        title: "Climate Migration and Legal Status",
        stimulus: `The Internal Displacement Monitoring Centre reported that 26.4 million people were displaced by weather-related events in 2024, yet there is no international legal framework recognising "climate refugees." The 1951 Refugee Convention defines refugees as those fleeing persecution, not environmental collapse. Tuvalu, whose highest point is 4.6 metres above sea level, signed a bilateral agreement with Australia in November 2023 granting 280 Tuvaluans per year residency rights, but this covers less than 2.5% of the population. The Global Compact on Refugees (2018) acknowledges climate as a "driver" of displacement but creates no binding obligations. Meanwhile, Bangladesh's Climate Change Strategy estimates that a 1-metre sea level rise would displace 17 million people internally, overwhelming domestic resettlement capacity. The Nansen Initiative's Protection Agenda, endorsed by 109 states in 2015, established principles for cross-border disaster displacement but relies entirely on voluntary implementation. Legal scholars have proposed an Optional Protocol to the UNFCCC that would create a climate mobility framework, but negotiations have stalled over whether host nations would receive compensation from high-emitting states. Pacific Island leaders have argued that climate displacement constitutes a form of slow-onset persecution, warranting expansion of the refugee definition, a position consistently rejected by major destination countries.`,
        source: "Adapted from IDMC, UNHCR, and Bangladeshi government reports, 2024 to 2025"
    },
    {
        num: 9,
        title: "Vaccine Equity and Pandemic Preparedness",
        stimulus: `Negotiations for the WHO Pandemic Treaty stalled in March 2025 over provisions mandating technology transfer for vaccine manufacturing. Pharmaceutical companies argued that compulsory licensing of mRNA platforms would destroy the financial incentives for future pandemic research. Meanwhile, Africa accounted for only 2.1% of global COVID-19 vaccine production despite hosting 17% of the world's population. The African Union's Partnerships for African Vaccine Manufacturing initiative set a target of producing 60% of Africa's routine vaccines domestically by 2040, but progress has been slow: only 6 of the AU's planned regional manufacturing hubs have broken ground. Gavi's Advance Market Commitment model successfully delivered 2 billion COVAX doses, but 70% arrived after wealthier nations had already vaccinated their adult populations. The WHO's proposed Pathogen Access and Benefit Sharing System would require countries identifying novel pathogens to share samples in exchange for guaranteed access to resulting vaccines, but several nations, citing past experiences where shared samples led to patents they could not afford, have resisted participation. South Africa's successful adaptation of mRNA technology for its own vaccine candidate demonstrated that technology transfer is feasible, but the initiative received minimal support from originator companies, raising questions about whether voluntary frameworks can deliver equity during health emergencies.`,
        source: "Adapted from WHO INB proceedings and Africa CDC reports, 2025"
    },
];

(async () => {
    const pdf = await PDFDocument.create();
    const fontR = await pdf.embedFont(StandardFonts.Helvetica);
    const fontB = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontI = await pdf.embedFont(StandardFonts.HelveticaOblique);
    const fontSerif = await pdf.embedFont(StandardFonts.TimesRomanBold);

    const W = PageSizes.A4[0]; // 595
    const H = PageSizes.A4[1]; // 842
    const MARGIN = 45;
    const CONTENT_W = W - 2 * MARGIN;

    let page, y;
    let pageCount = 0;

    // ─── Helpers ──────────────────────────────────────────────────

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

    function addPageNumber() {
        pageCount++;
        const pages = pdf.getPages();
        const p = pages[pages.length - 1];
        const text = `${pageCount}`;
        p.drawText(text, {
            x: (W - fontR.widthOfTextAtSize(text, 8)) / 2,
            y: 18,
            size: 8,
            font: fontR,
            color: C.slate,
        });
    }

    function newPage() {
        if (page) addPageNumber();
        page = pdf.addPage(PageSizes.A4);
        y = H - 35;
        // Running header
        const hText = "Policy Pivot Drill  |  IB Global Politics HL  |  Paper 3 Q2b";
        page.drawText(hText, {
            x: W - MARGIN - fontI.widthOfTextAtSize(hText, 7),
            y: H - 22,
            size: 7,
            font: fontI,
            color: C.slate,
        });
        y = H - 42;
        return page;
    }

    function checkSpace(needed) {
        if (y - needed < 50) {
            newPage();
        }
    }

    function drawWritingLines(count) {
        for (let i = 0; i < count; i++) {
            checkSpace(22);
            page.drawLine({
                start: { x: MARGIN + 5, y: y - 3 },
                end:   { x: W - MARGIN, y: y - 3 },
                thickness: 0.4,
                color: C.line,
            });
            y -= 22;
        }
    }

    function space(px = 8) { y -= px; }

    // ═══════════════════ COVER PAGE ═══════════════════════════════

    newPage();

    // Title banner
    const bannerH = 80;
    page.drawRectangle({
        x: MARGIN, y: y - bannerH,
        width: CONTENT_W, height: bannerH,
        color: C.purple,
    });
    page.drawRectangle({
        x: MARGIN, y: y - bannerH - 3,
        width: CONTENT_W, height: 3,
        color: C.green,
    });

    const t1 = "The Policy Pivot Drill";
    const t2 = "PAPER 3  \u00B7  Q2b TRAINING  \u00B7  9 DRILLS";
    page.drawText(t1, {
        x: MARGIN + (CONTENT_W - fontSerif.widthOfTextAtSize(t1, 20)) / 2,
        y: y - 35,
        size: 20,
        font: fontSerif,
        color: C.white,
    });
    page.drawText(t2, {
        x: MARGIN + (CONTENT_W - fontB.widthOfTextAtSize(t2, 9)) / 2,
        y: y - 58,
        size: 9,
        font: fontB,
        color: rgb(1, 1, 1),
    });
    y -= bannerH + 18;

    // Subtitle
    const sub = "Practice the hardest skill on Paper 3: reading an unseen stimulus and building a specific, grounded policy recommendation that connects your prepared knowledge to the evidence in front of you.";
    const subLines = wrapText(sub, fontR, 9, CONTENT_W - 20);
    for (const line of subLines) {
        page.drawText(line, { x: MARGIN + 10, y: y, size: 9, font: fontR, color: C.text });
        y -= 13;
    }
    y -= 10;

    // Instructions box
    const instrSteps = [
        "1.  Read each stimulus extract carefully (they mimic real Paper 3 source material).",
        "2.  Identify which GPC(s) the extract connects to most strongly.",
        "3.  In the Stimulus Connection box, write one sentence referencing something specific from the extract.",
        "4.  In the Policy Recommendation box, write a single paragraph (~200 words) using the AMR\u00B2 formula.",
        "5.  Your recommendation must respond to the specific issue in the stimulus, not be a generic pre-prepared answer.",
    ];
    // Calculate height
    let instrContentH = 22; // title
    for (const step of instrSteps) {
        const sLines = wrapText(step, fontR, 8.5, CONTENT_W - 35);
        instrContentH += sLines.length * 13 + 2;
    }
    instrContentH += 10;

    page.drawRectangle({ x: MARGIN, y: y - instrContentH, width: CONTENT_W, height: instrContentH, color: C.light });
    page.drawRectangle({ x: MARGIN, y: y - instrContentH, width: 4, height: instrContentH, color: C.purple });

    let iy = y - 14;
    page.drawText("How This Works", { x: MARGIN + 16, y: iy, size: 11, font: fontB, color: C.navy });
    iy -= 18;
    for (const step of instrSteps) {
        const sLines = wrapText(step, fontR, 8.5, CONTENT_W - 35);
        for (let i = 0; i < sLines.length; i++) {
            page.drawText(sLines[i], { x: MARGIN + 16 + (i > 0 ? 18 : 0), y: iy, size: 8.5, font: fontR, color: C.text });
            iy -= 13;
        }
        iy -= 2;
    }
    y -= instrContentH + 12;

    // AMR2 reminder box - color-coded, each component on its own line
    const amrComponents = [
        { letter: "A", label: "Actor", desc: "(with specific sub-unit)", color: hex("2C5FC4") },    // blue
        { letter: "M", label: "Mechanism", desc: "(citing real legislation or framework)", color: hex("6438B0") },  // purple
        { letter: "R", label: "Rationale", desc: "(evidence-based justification)", color: hex("1A8A5A") },  // green
        { letter: "R", label: "Risk + Mitigation", desc: "(naming a secondary actor)", color: hex("C0283E") },  // red
    ];
    const amrBoxH = 16 + amrComponents.length * 18 + 20; // title + lines + aim line + padding
    checkSpace(amrBoxH + 10);
    page.drawRectangle({ x: MARGIN, y: y - amrBoxH, width: CONTENT_W, height: amrBoxH, color: hex("FAFAFA") });
    page.drawRectangle({ x: MARGIN, y: y - amrBoxH, width: CONTENT_W, height: 2, color: C.border });
    page.drawRectangle({ x: MARGIN, y: y - 2, width: CONTENT_W, height: 2, color: C.border });

    let ay = y - 16;
    page.drawText("AMR\u00B2 Formula", { x: MARGIN + 16, y: ay, size: 10, font: fontB, color: C.navy });
    ay -= 20;

    for (const comp of amrComponents) {
        // Color dot
        page.drawCircle({ x: MARGIN + 22, y: ay + 3, size: 4, color: comp.color });
        // Letter
        page.drawText(comp.letter, {
            x: MARGIN + 18 + 4 - fontB.widthOfTextAtSize(comp.letter, 8) / 2, y: ay, size: 8, font: fontB, color: C.white,
        });
        // Label
        page.drawText(comp.label, { x: MARGIN + 32, y: ay, size: 9, font: fontB, color: comp.color });
        const lw = fontB.widthOfTextAtSize(comp.label, 9);
        // Description
        page.drawText("  " + comp.desc, { x: MARGIN + 32 + lw, y: ay, size: 8.5, font: fontR, color: C.slate });
        ay -= 18;
    }

    // Aim line
    page.drawText("Aim for ~200 words, the length you can handwrite in about 15 minutes.", {
        x: MARGIN + 16, y: ay + 2, size: 7.5, font: fontI, color: C.slate,
    });
    y -= amrBoxH + 14;

    // Name / Date line
    checkSpace(30);
    page.drawText("Name:", { x: MARGIN, y: y, size: 9, font: fontB, color: C.navy });
    page.drawLine({ start: { x: MARGIN + 40, y: y - 2 }, end: { x: W / 2 - 20, y: y - 2 }, thickness: 0.5, color: C.line });
    page.drawText("Date:", { x: W / 2, y: y, size: 9, font: fontB, color: C.navy });
    page.drawLine({ start: { x: W / 2 + 35, y: y - 2 }, end: { x: W - MARGIN, y: y - 2 }, thickness: 0.5, color: C.line });
    y -= 30;

    // ═══════════════════ DRILL PAGES ═════════════════════════════

    for (const drill of drills) {
        // Start each drill on a new page
        newPage();

        // ─── Drill Header (no GPC tags) ──────────────────────────
        const headerH = 28;
        page.drawRectangle({
            x: MARGIN, y: y - headerH,
            width: CONTENT_W, height: headerH,
            color: hex("F5F3FA"),
        });
        page.drawRectangle({
            x: MARGIN, y: y - headerH,
            width: 4, height: headerH,
            color: C.purple,
        });

        // Drill number circle
        const circX = MARGIN + 20;
        const circY = y - headerH / 2;
        page.drawCircle({ x: circX, y: circY, size: 11, color: C.purple });
        const numStr = String(drill.num);
        page.drawText(numStr, {
            x: circX - fontB.widthOfTextAtSize(numStr, 10) / 2,
            y: circY - 4,
            size: 10,
            font: fontB,
            color: C.white,
        });

        // Title only (no GPC tags)
        page.drawText(drill.title, {
            x: MARGIN + 38,
            y: y - headerH / 2 - 4,
            size: 11,
            font: fontB,
            color: C.navy,
        });

        y -= headerH + 10;

        // ─── Stimulus Extract ────────────────────────────────────
        page.drawText("STIMULUS EXTRACT", {
            x: MARGIN + 5,
            y: y,
            size: 7,
            font: fontB,
            color: C.slate,
        });
        y -= 12;

        // Draw stimulus text
        const stimLines = wrapText(drill.stimulus, fontR, 8.5, CONTENT_W - 20);
        const stimH = stimLines.length * 12 + 24;

        // Check if stimulus + response will fit, may need to spill to second page
        page.drawRectangle({
            x: MARGIN, y: y - stimH,
            width: CONTENT_W, height: stimH,
            color: C.white,
            borderColor: C.border,
            borderWidth: 0.7,
        });

        let sy = y - 12;
        for (const line of stimLines) {
            page.drawText(line, { x: MARGIN + 10, y: sy, size: 8.5, font: fontR, color: C.text });
            sy -= 12;
        }
        // Source
        page.drawText(drill.source, {
            x: MARGIN + 10,
            y: sy - 2,
            size: 7,
            font: fontI,
            color: C.slate,
        });

        y -= stimH + 10;

        // ─── Stimulus Connection prompt ──────────────────────────
        const connH = 18;
        checkSpace(connH + 10);
        page.drawRectangle({
            x: MARGIN, y: y - connH,
            width: CONTENT_W, height: connH,
            color: C.greenBg,
        });
        page.drawRectangle({
            x: MARGIN, y: y - connH,
            width: 3, height: connH,
            color: C.green,
        });
        page.drawText("Before writing your policy, identify one specific detail from the stimulus you will reference in your answer.", {
            x: MARGIN + 10,
            y: y - 12,
            size: 7.5,
            font: fontB,
            color: C.green,
        });
        y -= connH + 10;

        // ─── Stimulus Connection writing area ────────────────────
        checkSpace(80);
        page.drawText("STIMULUS CONNECTION (1 SENTENCE)", {
            x: MARGIN + 5,
            y: y,
            size: 7,
            font: fontB,
            color: C.slate,
        });
        y -= 12;
        drawWritingLines(3);
        space(6);

        // ─── Policy Recommendation writing area ──────────────────
        checkSpace(60);
        page.drawText("YOUR POLICY RECOMMENDATION (~200 WORDS)", {
            x: MARGIN + 5,
            y: y,
            size: 7,
            font: fontB,
            color: C.slate,
        });
        y -= 12;

        // Fill remaining page with writing lines
        const linesAvailable = Math.floor((y - 55) / 22);
        const linesToDraw = Math.min(linesAvailable, 22);
        drawWritingLines(linesToDraw);

        space(8);

        // Word count reminder
        const wcText = "Target: ~200 words";
        page.drawText(wcText, {
            x: W - MARGIN - fontI.widthOfTextAtSize(wcText, 7),
            y: y + 2,
            size: 7,
            font: fontI,
            color: C.slate,
        });
    }

    // Final page number
    addPageNumber();

    // ─── Save ────────────────────────────────────────────────────
    const bytes = await pdf.save();
    const outPath = __dirname + "/Policy_Pivot_Drill.pdf";
    fs.writeFileSync(outPath, bytes);
    console.log("\u2705  PDF created:", outPath);
})();
