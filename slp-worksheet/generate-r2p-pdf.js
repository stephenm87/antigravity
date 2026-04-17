const puppeteer = require("puppeteer");
const path = require("path");

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    const htmlPath = path.resolve(__dirname, "../r2p-case-study-review.html");
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0", timeout: 30000 });

    // Wait a moment for fonts and animations to settle
    await new Promise((r) => setTimeout(r, 2000));

    const outPath = path.resolve(__dirname, "R2P_Case_Study_Review.pdf");
    await page.pdf({
        path: outPath,
        format: "A4",
        printBackground: true,      // Critical: preserves dark background
        preferCSSPageSize: false,
        margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    console.log("✅  PDF created:", outPath);
    await browser.close();
})();
