import { useEffect } from 'react';
import { useI18n } from './i18n';
import { translateDynamic } from './QuestionTranslator';
import en from '../locales/en.json';
import hi from '../locales/hi.json';

const enToHi = {};
for (const key in en) {
  if (typeof en[key] === 'string' && typeof hi[key] === 'string') {
    enToHi[en[key].trim().toLowerCase()] = hi[key];
  }
}

const extraDict = {
  "addition": "जोड़",
  "practice addition!": "जोड़ का अभ्यास करें!",
  "choose a level and solve addition questions": "एक स्तर चुनें और जोड़ के प्रश्नों को हल करें",
  "easy — 1 digit": "सरल — 1 अंक",
  "medium — 2 digits": "मध्यम — 2 अंक",
  "hard — 3 digits": "कठिन — 3 अंक",
  "extra hard — 4 digits": "अत्यंत कठिन — 4 अंक",
  "adaptive": "अनुकूली",
  "how many questions?": "कितने प्रश्न?",
  "start quiz": "प्रश्नोत्तरी शुरू करें",
  "finish quiz": "प्रश्नोत्तरी समाप्त करें",
  "next question": "अगला प्रश्न",
  "subtraction": "घटाव",
  "practice subtraction!": "घटाव का अभ्यास करें!",
  "multiplication": "गुणा",
  "practice multiplication!": "गुणा का अभ्यास करें!",
  "division": "भाग",
  "practice division!": "भाग का अभ्यास करें!",
  "number bases": "संख्या आधार",
  "binary, decimal, hexadecimal": "बाइनरी, दशमलव, हेक्साडेसिमल",
  "easy — dec→bin": "सरल — दशमलव→बाइनरी",
  "medium — bin→dec": "मध्यम — बाइनरी→दशमलव",
  "hard — dec→hex": "कठिन — दशमलव→हेक्सा",
  "extra hard — bin add / hex→bin": "अत्यंत कठिन — बाइनरी जोड़ / हेक्सा→बाइनरी",
  "starts easy and smoothly adjusts to your level as you answer.": "आसान से शुरू होता है और आपके उत्तर देने पर सुचारू रूप से आपके स्तर के अनुसार समायोजित हो जाता है।",
  "session optimizer": "सत्र अनुकूलक",
  "smart practice built for your schedule": "आपके कार्यक्रम के लिए बनाया गया स्मार्ट अभ्यास",
  "how much time do you have today?": "आज आपके पास कितना समय है?",
  "your 15-minute session plan:": "आपकी 15-मिनट की सत्र योजना:",
  "your 30-minute session plan:": "आपकी 30-मिनट की सत्र योजना:",
  "your 45-minute session plan:": "आपकी 45-मिनट की सत्र योजना:",
  "your 60-minute session plan:": "आपकी 60-मिनट की सत्र योजना:",
  "start session": "सत्र शुरू करें",
  "session complete!": "सत्र पूरा हुआ!",
  "great job investing your time!": "अपना समय निवेश करने के लिए बहुत बढ़िया काम!",
  "return home": "घर लौटें",
  "performance by phase": "चरण के अनुसार प्रदर्शन",
  "warm-up": "वार्म-अप",
  "core practice": "मुख्य अभ्यास",
  "cool-down": "कूल-डाउन",
  "🌱 warm-up": "🌱 वार्म-अप",
  "🧠 core": "🧠 मुख्य",
  "🧠 core practice": "🧠 मुख्य अभ्यास",
  "✨ cool-down": "✨ कूल-डाउन",
  "target class level": "लक्ष्य कक्षा स्तर",
  "all classes (mixed)": "सभी कक्षाएं (मिश्रित)",
  "class 1": "कक्षा 1",
  "class 2": "कक्षा 2",
  "class 3": "कक्षा 3",
  "class 4": "कक्षा 4",
  "class 5": "कक्षा 5",
  "class 6": "कक्षा 6",
  "class 7": "कक्षा 7",
  "class 8": "कक्षा 8",
  "class 9": "कक्षा 9",
  "class 10": "कक्षा 10",
  "class 11": "कक्षा 11",
  "class 12": "कक्षा 12",
  "💡 learning explanation": "💡 सीखने के लिए स्पष्टीकरण",
  "skip & learn": "छोड़ें और सीखें"
};

function translateText(text) {
  if (!text || !text.trim()) return text;
  const lower = text.trim().toLowerCase();
  
  // Exact match from en.json
  if (enToHi[lower]) return text.replace(text.trim(), enToHi[lower]);
  
  // Exact match from extraDict
  if (extraDict[lower]) return text.replace(text.trim(), extraDict[lower]);
  
  // Regex dynamic match
  const dyn = translateDynamic(text, 'hi');
  if (dyn !== text) return dyn;
  
  return text;
}

export function AutoTranslator() {
  const { locale } = useI18n();

  useEffect(() => {
    if (locale !== 'hi') return;

    const translateNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.parentElement && node.parentElement.closest('.no-translate, script, style')) return;
        const original = node.nodeValue;
        if (original && original.trim()) {
          const translated = translateText(original);
          if (translated !== original) {
            node.nodeValue = translated;
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.matches('.no-translate, script, style')) return;
        // Translate placeholders
        if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
          const ph = node.getAttribute('placeholder');
          if (ph) {
            const tph = translateText(ph);
            if (tph !== ph) node.setAttribute('placeholder', tph);
          }
        }
        node.childNodes.forEach(translateNode);
      }
    };

    // Initial translation
    translateNode(document.body);

    // Watch for dynamic updates
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.type === 'childList') {
          m.addedNodes.forEach(node => translateNode(node));
        } else if (m.type === 'characterData') {
          // If React updates a text node with English, translate it back
          const node = m.target;
          if (node.nodeType === Node.TEXT_NODE) {
             const original = node.nodeValue;
             if (original && original.trim()) {
               const translated = translateText(original);
               if (translated !== original) {
                 // Disconnect temporarily to avoid infinite loop
                 observer.disconnect();
                 node.nodeValue = translated;
                 observer.observe(document.body, { childList: true, subtree: true, characterData: true });
               }
             }
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observer.disconnect();
  }, [locale]);

  return null;
}
