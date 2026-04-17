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

  const htmlPath = path.resolve(__dirname, "poster.html");
  await page.goto(`file://${htmlPath}`, {
    waitUntil: "networkidle0",
    timeout: 30000,
  });

  await page.evaluateHandle("document.fonts.ready");

  const outPath = path.resolve(__dirname, "living_history_poster_v11.pdf");

  await page.pdf({
    path: outPath,
    width: "8.5in",
    height: "8.5in",
    printBackground: true,
    margin: { top: "0", bottom: "0", left: "0", right: "0" },
  });

  await browser.close();
  console.log("✅ PDF saved:", outPath);
})();
