const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    // Go to the HCF/LCM quiz page
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Click HCF & LCM topic button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const hcflcm = buttons.find(b => b.textContent.includes('HCF & LCM'));
      if (hcflcm) hcflcm.click();
    });
    
    await new Promise(r => setTimeout(r, 2000)); // wait for quiz to render
    
    // Check if mafs canvas exists
    const hasMafs = await page.evaluate(() => {
      return !!document.querySelector('.MafsView');
    });
    console.log("Mafs rendered:", hasMafs);
    
    await page.screenshot({ path: '/Users/sam/.gemini/antigravity/brain/b6b00971-6221-44bd-bee5-67a05d05b55e/mafs_test.png' });
    console.log("Screenshot saved.");
  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
