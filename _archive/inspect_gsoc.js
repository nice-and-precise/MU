const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://mn.itic.occinc.com/search');
    const content = await page.content();
    fs.writeFileSync('gsoc_dump.html', content);
    await browser.close();
})();
