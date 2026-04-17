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
    const htmlPath = path.resolve(__dirname, "..", "r2p-observer-briefing.html");
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0", timeout: 30000 });
    await page.evaluateHandle("document.fonts.ready");

    const outPath = path.resolve(__dirname, "..", "R2P_Observer_Briefing.pdf");
    await page.pdf({
        path: outPath,
        format: "Letter",
        printBackground: true,
        margin: { top: "0.3in", bottom: "0.3in", left: "0.3in", right: "0.3in" },
    });

    await browser.close();
    console.log("✅ PDF saved:", outPath);
})();
