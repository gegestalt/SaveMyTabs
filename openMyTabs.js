const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

function isValidUrl(url) {
    const regex = /^(https?:\/\/)([^\s$.?#].[^\s]*)$/;
    return regex.test(url);
}

(async () => {
    const jsonFiles = fs.readdirSync('./').filter((file) => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
        console.error('No JSON files found in the current directory.');
        process.exit(1);
    }

    let selectedFile;

    if (jsonFiles.length === 1) {
        selectedFile = jsonFiles[0];
        console.log(`Found only one JSON file: ${selectedFile}`);
    } else {
        console.log('Multiple JSON files found:');
        jsonFiles.forEach((file, index) => {
            console.log(`${index + 1}. ${file}`);
        });

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        const userChoice = await new Promise((resolve) => {
            rl.question('Enter the number of the file to load: ', (answer) => {
                rl.close();
                resolve(parseInt(answer.trim(), 10));
            });
        });

        if (isNaN(userChoice) || userChoice < 1 || userChoice > jsonFiles.length) {
            console.error('Invalid selection. Exiting.');
            process.exit(1);
        }

        selectedFile = jsonFiles[userChoice - 1];
    }

    const jsonFilePath = path.resolve('./', selectedFile);
    const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

    let urls;
    if (Array.isArray(data)) {
        urls = data.map((item) => (typeof item === 'object' && item.url ? item.url : item)).filter(isValidUrl);
    } else if (typeof data === 'object' && data.url) {
        urls = [data.url];
    } else {
        console.error(`The JSON file (${selectedFile}) does not contain valid URL data.`);
        process.exit(1);
    }

    if (urls.length === 0) {
        console.error(`No valid URLs found in the JSON file (${selectedFile}).`);
        process.exit(1);
    }

    console.log(`Opening ${urls.length} URLs from ${selectedFile}...`);

    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
        defaultViewport: null,
        ignoreHTTPSErrors: true,
    });

    for (const url of urls) {
        if (!isValidUrl(url)) {
            console.log(`Skipping invalid URL: ${url}`);
            continue;
        }

        const page = await browser.newPage();

        try {
            await page.goto(url);
            console.log(`Opened: ${url}`);
        } catch (error) {
            console.error(`Failed to navigate to URL: ${url} - Error: ${error.message}`);
        }
    }

    console.log('All URLs have been processed.');
})();
