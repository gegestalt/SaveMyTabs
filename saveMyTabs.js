const puppeteer = require('puppeteer');
const CDP = require('chrome-remote-interface');
const fs = require('fs');

(async () => {
    try {
        const browser = await puppeteer.connect({
            browserURL: 'http://localhost:9222', // Ensure Chrome is running in debugging mode
        });

        // Get all open pages
        const pages = await browser.pages();

        if (pages.length === 0) {
            console.log('No tabs are currently open.');
            await browser.disconnect();
            return;
        }

        // Fetch URLs and cookies for each page using Chrome Remote Interface for more cookie details
        const tabData = await Promise.all(
            pages.map(async (page) => {
                const url = page.url();

                // Use chrome-remote-interface to gather detailed cookies
                const cookies = await new Promise((resolve, reject) => {
                    CDP(async (client) => {
                        const { Network } = client;
                        await Network.enable();
                        try {
                            const { cookies } = await Network.getCookies({ urls: [url] });
                            resolve(cookies);
                        } catch (err) {
                            reject(err);
                        } finally {
                            client.close();
                        }
                    });
                });

                return { url, cookies }; // Store both URL and cookies
            })
        );

        // Get the current timestamp
        const now = new Date();
        const timestamp = now.toISOString().replace(/:/g, '-').replace(/\..+/, ''); 

        // Define the file names
        const urlsFile = `open_tabs_urls_${timestamp}.json`;
        const urlsWithCookiesFile = `open_tabs_with_cookies_${timestamp}.json`;

        // Save only URLs to one file
        const urlsOnly = tabData.map(tab => tab.url);
        fs.writeFileSync(urlsFile, JSON.stringify(urlsOnly, null, 2));
        console.log(`URLs of open tabs saved to ${urlsFile}`);

        fs.writeFileSync(urlsWithCookiesFile, JSON.stringify(tabData, null, 2));
        console.log(`URLs and cookies of open tabs saved to ${urlsWithCookiesFile}`);

        await browser.disconnect();
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();
