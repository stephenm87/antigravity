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

    const htmlPath = path.resolve(__dirname, "..", "slp-expectations-guide.html");
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0", timeout: 30000 });

    // Wait for fonts to load
    await page.evaluateHandle("document.fonts.ready");

    const outPath = path.resolve(__dirname, "..", "SLP_Expectations_Guide.pdf");

    await page.pdf({
        path: outPath,
        format: "Letter",
        printBackground: true,
        margin: { top: "0.4in", bottom: "0.4in", left: "0.4in", right: "0.4in" },
    });

    await browser.close();
    console.log("✅ PDF saved:", outPath);
})();
