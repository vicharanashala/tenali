export function translateDynamic(text, locale) {
  if (!text || typeof text !== 'string') return text;
  
  if (locale === 'hi') {
    let t = text;

    // Standard Math Word Problems
    t = t.replace(/Round ([\d\.]+) to (\d+) decimal place(s)?\./gi, "$1 को $2 दशमलव स्थानों तक पूर्णांकित करें।");
    t = t.replace(/Round ([\d\.]+) to (\d+) significant figure(s)?\./gi, "$1 को $2 सार्थक अंकों तक पूर्णांकित करें।");
    t = t.replace(/Find the probability of getting (.*) when rolling a fair six-sided die\./gi, "निष्पक्ष पासा फेंकने पर $1 प्राप्त करने की प्रायिकता ज्ञात करें।");
    t = t.replace(/A bag contains (\d+) (.*) and (\d+) (.*)\./gi, "एक बैग में $1 $2 और $3 $4 हैं।");
    t = t.replace(/A car travels at ([\d\.]+) km\/h for ([\d\.]+) hours\. How far does it travel \(in km\)\?/gi, "एक कार $1 किमी/घंटा की गति से $2 घंटे तक यात्रा करती है। यह कितनी दूर यात्रा करती है (किमी में)?");
    t = t.replace(/A train covers ([\d\.]+) km at ([\d\.]+) km\/h\. How long does the journey take \(in hours\)\?/gi, "एक ट्रेन $1 किमी की दूरी $2 किमी/घंटा की गति से तय करती है। यात्रा में कितना समय लगता है (घंटों में)?");
    t = t.replace(/A cyclist rides ([\d\.]+) km at ([\d\.]+) km\/h then ([\d\.]+) km at ([\d\.]+) km\/h\. Find the average speed \(to 2 d\.p\. if needed\)\./gi, "एक साइकिल चालक $1 किमी $2 किमी/घंटा की गति से और फिर $3 किमी $4 किमी/घंटा की गति से सवारी करता है। औसत गति ज्ञात करें (यदि आवश्यक हो तो 2 दशमलव स्थानों तक)।");
    t = t.replace(/Convert ([\d\.]+) m\/s to km\/h\./gi, "$1 मीटर/सेकंड को किमी/घंटा में बदलें।");
    t = t.replace(/y is directly proportional to x\. When x = ([\d\.]+), y = ([\d\.]+)\. Find y when x = ([\d\.]+)\./gi, "y, x के सीधे समानुपाती है। जब x = $1, तो y = $2। x = $3 होने पर y ज्ञात करें।");
    t = t.replace(/y is inversely proportional to x\. When x = ([\d\.]+), y = ([\d\.]+)\. Find y when x = ([\d\.]+)\./gi, "y, x के व्युत्क्रमानुपाती है। जब x = $1, तो y = $2। x = $3 होने पर y ज्ञात करें।");
    t = t.replace(/y is directly proportional to x²\. When x = ([\d\.]+), y = ([\d\.]+)\. Find y when x = ([\d\.]+)\./gi, "y, x² के सीधे समानुपाती है। जब x = $1, तो y = $2। x = $3 होने पर y ज्ञात करें।");
    t = t.replace(/y is inversely proportional to √x\. When x = ([\d\.]+), y = ([\d\.]+)\. Find y when x = ([\d\.]+)\./gi, "y, √x के व्युत्क्रमानुपाती है। जब x = $1, तो y = $2। x = $3 होने पर y ज्ञात करें।");
    t = t.replace(/An item is bought for \$([\d\.]+) and sold for \$([\d\.]+)\. Find the profit\./gi, "एक वस्तु $$1 में खरीदी जाती है और $$2 में बेची जाती है। लाभ ज्ञात करें।");
    t = t.replace(/Cost price = \$([\d\.]+), selling price = \$([\d\.]+)\. Find the profit percentage\./gi, "क्रय मूल्य = $$1, विक्रय मूल्य = $$2। लाभ प्रतिशत ज्ञात करें।");
    t = t.replace(/A shirt has a marked price of \$([\d\.]+)\. A ([\d\.]+)% discount is applied\. Find the selling price\./gi, "एक शर्ट का अंकित मूल्य $$1 है। $2% की छूट दी जाती है। विक्रय मूल्य ज्ञात करें।");
    t = t.replace(/Marked price is \$([\d\.]+)\. Successive discounts of ([\d\.]+)% and ([\d\.]+)% are applied\. Find the final price\./gi, "अंकित मूल्य $$1 है। $2% और $3% की क्रमिक छूट लागू की जाती है। अंतिम मूल्य ज्ञात करें।");
    t = t.replace(/Calculate the (Speed|Distance|Time) if (.*)\./gi, "यदि $2 हो तो $1 ज्ञात करें।");
    t = t.replace(/Expand and simplify (.*)/gi, "$1 का विस्तार और सरलीकरण करें");
    t = t.replace(/Find the roots of (.*)/gi, "$1 के मूल ज्ञात करें");
    t = t.replace(/Solve for (x|y|z):/gi, "$1 के लिए हल करें:");
    t = t.replace(/Factorise completely:/gi, "पूर्णतः गुणनखंडन करें:");
    t = t.replace(/Factorise:/gi, "गुणनखंडन करें:");
    t = t.replace(/Simplify the ratio (.*)/gi, "अनुपात $1 को सरल करें");
    t = t.replace(/Find the HCF of (.*)/gi, "$1 का म.स.प. (HCF) ज्ञात करें");
    t = t.replace(/Find the LCM of (.*)/gi, "$1 का ल.स.प. (LCM) ज्ञात करें");
    
    // Geometry
    t = t.replace(/Find the area of a circle with radius (.*)/gi, "त्रिज्या $1 वाले वृत्त का क्षेत्रफल ज्ञात करें");
    t = t.replace(/Find the circumference of a circle with radius (.*)/gi, "त्रिज्या $1 वाले वृत्त की परिधि ज्ञात करें");

    // Arithmetic
    t = t.replace(/Convert (.*) to (.*)/gi, "$1 को $2 में बदलें");
    t = t.replace(/What is (.*)\?/gi, "$1 क्या है?");
    t = t.replace(/Evaluate (.*)/gi, "$1 का मान ज्ञात करें");
    t = t.replace(/Calculate (.*)/gi, "$1 की गणना करें");
    t = t.replace(/Solve (.*)/gi, "$1 को हल करें");

    // General substitutions
    t = t.replace(/\bSpeed\b/g, "गति");
    t = t.replace(/\bDistance\b/g, "दूरी");
    t = t.replace(/\bTime\b/g, "समय");
    t = t.replace(/\bProfit\b/g, "लाभ");
    t = t.replace(/\bLoss\b/g, "हानि");
    t = t.replace(/\bSolution:\b/g, "समाधान:");
    t = t.replace(/\bExplanation:\b/g, "व्याख्या:");
    t = t.replace(/\bCorrect!\b/g, "सही!");
    
    // Add additional regex replacements for other templates as needed.
    return t;
  }
  
  return text;
}
