const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222', 
    });
    const pages = await browser.pages();

    const urls = await Promise.all(
        pages.map(async (page) => {
            return page.url();
        })
    );
    const now = new Date();
    const timestamp = now.toISOString().replace(/:/g, '-').replace(/\..+/, ''); 
    const fs = require('fs');
    const outputFile = `open_tabs_${timestamp}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(urls, null, 2));

    console.log(`URLs of open tabs saved to ${outputFile}`);
    
    await browser.disconnect();
})();
