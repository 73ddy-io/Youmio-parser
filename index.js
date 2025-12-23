const fs = require('fs/promises');
const puppeteer = require('puppeteer');

/**
 * Number of characters to scrape (default: 40)
 * Usage: node index.js 100
 */
const targetCount = Number(process.argv[2]) || 40;

/** Starting URL with character discovery page */
const START_URL = 'https://app.youmio.ai/';

/**
 * Simple delay utility
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Main scraping function
 * Scrolls page infinitely until targetCount valid characters collected
 * Only processes links containing "?back-url=home" parameter
 */
async function main() {
  console.log(`Starting scraper: target ${targetCount} characters`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  );

  console.log('Loading page...');
  await page.goto(START_URL, { waitUntil: 'networkidle2', timeout: 60000 });

  try {
    await page.waitForSelector('article a[href^="/discovery/"]', { timeout: 15000 });
  } catch (e) {
    console.log('Cards not immediately visible, starting scroll...');
  }
  
  await delay(2000);

  console.log('Beginning collection...');
  
  let lastRealCount = 0;
  let sameTries = 0;
  let scrollCount = 0;
  const maxScrolls = 200;
  let finalData = [];

  while (true) {
    finalData = await page.$$eval('article', (articles) => {
      const results = [];
      const seen = new Set();

      articles.forEach(article => {
        const linkEl = article.querySelector('a[href^="/discovery/"]');
        if (!linkEl) return;

        const href = linkEl.getAttribute('href');

        if (!href || !href.includes('back-url=home')) {
          return;
        }

        if (seen.has(href)) return;
        seen.add(href);

        const nameEl = article.querySelector('h2[title]');
        if (!nameEl) return; 
        
        const name = nameEl.textContent.trim();
        
        let popularity = '0';
        const footerSection = article.querySelector('section.mt-auto');
        if (footerSection) {
          const btn = footerSection.querySelector('button');
          if (btn) popularity = btn.textContent.trim() || '0';
        }

        const fullUrl = href.startsWith('http') ? href : window.location.origin + href;
        
        results.push({ name, popularity, url: fullUrl });
      });
      return results;
    });

    const realCount = finalData.length;
    console.log(`Valid characters collected: ${realCount}/${targetCount} | Scrolls: ${scrollCount}`);

    if (realCount >= targetCount) {
      console.log('✅ Target reached!');
      break;
    }

    if (realCount === lastRealCount && realCount > 0) {
      sameTries++;
      if (sameTries >= 5) {
        console.log('End of list detected');
        break;
      }
    } else {
      sameTries = 0;
    }

    lastRealCount = realCount;
    
    if (++scrollCount > maxScrolls) {
      console.log('Scroll limit reached');
      break;
    }

    await page.evaluate(async () => {
      window.scrollBy(0, window.innerHeight * 1.5);
    });

    await delay(1500);
  }

  const result = finalData.slice(0, targetCount);
  
  console.log(`FINAL RESULT: ${result.length} characters`);
  
  await fs.writeFile('result.json', JSON.stringify(result, null, 2), 'utf8');
  console.log('💾 Saved to result.json');
  
  await browser.close();
}

main().catch(err => {
  console.error('💥 Error:', err);
});
