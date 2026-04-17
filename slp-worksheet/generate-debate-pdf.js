const puppeteer = require("puppeteer-core");
const path = require("path");

(async () => {
    const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    const htmlPath = path.resolve(__dirname, "..", "r2p-debate-structure.html");
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0", timeout: 30000 });

    await page.evaluateHandle("document.fonts.ready");

    // Hide the teacher section for the student-facing PDF
    await page.evaluate(() => {
        // Remove the "For the Teacher" section and its preceding divider
        const sections = document.querySelectorAll('.section');
        for (const section of sections) {
            const title = section.querySelector('.section-title');
            if (title && title.textContent.includes('For the Teacher')) {
                const prevDivider = section.previousElementSibling;
                if (prevDivider && prevDivider.tagName === 'HR') prevDivider.remove();
                section.remove();
                break;
            }
        }
    });

    const outPath = path.resolve(__dirname, "..", "R2P_Fishbowl_Debate_Structure.pdf");

    await page.pdf({
        path: outPath,
        format: "Letter",
        printBackground: true,
        margin: { top: "0.4in", bottom: "0.4in", left: "0.4in", right: "0.4in" },
    });

    await browser.close();
    console.log("✅ PDF saved:", outPath);
})();
