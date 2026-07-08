const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Check main menu
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => b.textContent);
    });
    console.log("Buttons:", buttons);
    
    // Click HCF & LCM topic button using page.evaluate to click
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('HCF'));
      if (b) b.click();
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Check what is rendered
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    if (bodyHTML.includes('MafsView')) {
      console.log("MafsView found in HTML string!");
    } else {
      console.log("MafsView NOT found in HTML string.");
    }

    await page.screenshot({ path: '/Users/sam/.gemini/antigravity/brain/b6b00971-6221-44bd-bee5-67a05d05b55e/mafs_test2.png' });
    console.log("Screenshot saved.");
  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
