import { useEffect, useState, useRef } from 'react';
import { useI18n } from './i18n';
import { translateDynamic } from './QuestionTranslator';
import en from '../locales/en.json';


const extraDicts = {
  hi: {
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
  },
  ta: {
    "addition": "கூட்டல்",
    "practice addition!": "கூட்டல் பயிற்சி செய்!",
    "choose a level and solve addition questions": "ஒரு நிலையைத் தேர்ந்தெடுத்து கூட்டல் கேள்விகளைத் தீர்க்கவும்",
    "easy — 1 digit": "எளிது — 1 இலக்கம்",
    "medium — 2 digits": "நடுத்தரம் — 2 இலக்கங்கள்",
    "hard — 3 digits": "கடினம் — 3 இலக்கங்கள்",
    "extra hard — 4 digits": "மிகக் கடினம் — 4 இலக்கங்கள்",
    "adaptive": "தகவமைப்பு",
    "how many questions?": "எத்தனை கேள்விகள்?",
    "start quiz": "வினாடி வினாவைத் தொடங்கு",
    "finish quiz": "வினாடி வினாவை முடி",
    "next question": "அடுத்த கேள்வி",
    "subtraction": "கழித்தல்",
    "practice subtraction!": "கழித்தல் பயிற்சி செய்!",
    "multiplication": "பெருக்கல்",
    "practice multiplication!": "பெருக்கல் பயிற்சி செய்!",
    "division": "வகுத்தல்",
    "practice division!": "வகுத்தல் பயிற்சி செய்!",
    "number bases": "எண் அடிப்படைகள்",
    "binary, decimal, hexadecimal": "இரும, பதின்ம, அறுபதின்ம",
    "easy — dec→bin": "எளிது — dec→bin",
    "medium — bin→dec": "நடுத்தரம் — bin→dec",
    "hard — dec→hex": "கடினம் — dec→hex",
    "extra hard — bin add / hex→bin": "மிகக் கடினம் — bin add / hex→bin",
    "starts easy and smoothly adjusts to your level as you answer.": "எளிதாகத் தொடங்கி நீங்கள் பதிலளிக்கும்போது உங்கள் நிலைக்கு ஏற்ப சீராக மாறும்.",
    "session optimizer": "அமர்வு உகப்பாக்கி",
    "smart practice built for your schedule": "உங்கள் நேரத்துக்காக உருவாக்கப்பட்ட ஸ்மார்ட் பயிற்சி",
    "how much time do you have today?": "இன்று உங்களிடம் எவ்வளவு நேரம் உள்ளது?",
    "your 15-minute session plan:": "உங்கள் 15-நிமிட அமர்வுத் திட்டம்:",
    "your 30-minute session plan:": "உங்கள் 30-நிமிட அமர்வுத் திட்டம்:",
    "your 45-minute session plan:": "உங்கள் 45-நிமிட அமர்வுத் திட்டம்:",
    "your 60-minute session plan:": "உங்கள் 60-நிமிட அமர்வுத் திட்டம்:",
    "start session": "அமர்வைத் தொடங்கு",
    "session complete!": "அமர்வு முடிந்தது!",
    "great job investing your time!": "உங்கள் நேரத்தை முதலீடு செய்ததில் சிறந்த வேலை!",
    "return home": "முகப்பிற்குத் திரும்பு",
    "performance by phase": "கட்டத்தின்படி செயல்திறன்",
    "warm-up": "வார்ம்-அப்",
    "core practice": "முக்கிய பயிற்சி",
    "cool-down": "கூல்-டவுன்",
    "🌱 warm-up": "🌱 வார்ம்-அப்",
    "🧠 core": "🧠 முக்கிய",
    "🧠 core practice": "🧠 முக்கிய பயிற்சி",
    "✨ cool-down": "✨ கூல்-டவுன்",
    "target class level": "இலக்கு வகுப்பு நிலை",
    "all classes (mixed)": "அனைத்து வகுப்புகளும் (கலப்பு)",
    "class 1": "வகுப்பு 1",
    "class 2": "வகுப்பு 2",
    "class 3": "வகுப்பு 3",
    "class 4": "வகுப்பு 4",
    "class 5": "வகுப்பு 5",
    "class 6": "வகுப்பு 6",
    "class 7": "வகுப்பு 7",
    "class 8": "வகுப்பு 8",
    "class 9": "வகுப்பு 9",
    "class 10": "வகுப்பு 10",
    "class 11": "வகுப்பு 11",
    "class 12": "வகுப்பு 12",
    "💡 learning explanation": "💡 கற்றல் விளக்கம்",
    "skip & learn": "தவிர் மற்றும் கற்றுக்கொள்"
  },
  mr: {
    "addition": "बेरीज",
    "practice addition!": "बेरजेचा सराव करा!",
    "choose a level and solve addition questions": "पातळी निवडा आणि बेरजेचे प्रश्न सोडवा",
    "easy — 1 digit": "सोपे — 1 अंक",
    "medium — 2 digits": "मध्यम — 2 अंक",
    "hard — 3 digits": "कठीण — 3 अंक",
    "extra hard — 4 digits": "अति कठीण — 4 अंक",
    "adaptive": "अनुकूलनीय",
    "how many questions?": "किती प्रश्न?",
    "start quiz": "क्विझ सुरू करा",
    "finish quiz": "क्विझ पूर्ण करा",
    "next question": "पुढचा प्रश्न",
    "subtraction": "वजाबाकी",
    "practice subtraction!": "वजाबाकीचा सराव करा!",
    "multiplication": "गुणाकार",
    "practice multiplication!": "गुणाकाराचा सराव करा!",
    "division": "भागाकार",
    "practice division!": "भागाकाराचा सराव करा!",
    "number bases": "संख्या आधार",
    "binary, decimal, hexadecimal": "द्विमान, दशमान, हेक्साडेसिमल",
    "easy — dec→bin": "सोपे — दशमान→द्विमान",
    "medium — bin→dec": "मध्यम — द्विमान→दशमान",
    "hard — dec→hex": "कठीण — दशमान→हेक्सा",
    "extra hard — bin add / hex→bin": "अति कठीण — द्विमान बेरीज / हेक्सा→द्विमान",
    "starts easy and smoothly adjusts to your level as you answer.": "सोप्यापासून सुरू होते आणि आपण उत्तरे दिल्यास आपल्या पातळीनुसार सुरळीतपणे समायोजित होते.",
    "session optimizer": "सत्र ऑप्टिमायझर",
    "smart practice built for your schedule": "आपल्या वेळापत्रकासाठी तयार केलेला स्मार्ट सराव",
    "how much time do you have today?": "आज तुमच्याकडे किती वेळ आहे?",
    "your 15-minute session plan:": "आपला 15-मिनिटांचा सत्र योजना:",
    "your 30-minute session plan:": "आपला 30-मिनिटांचा सत्र योजना:",
    "your 45-minute session plan:": "आपला 45-मिनिटांचा सत्र योजना:",
    "your 60-minute session plan:": "आपला 60-मिनिटांचा सत्र योजना:",
    "start session": "सत्र सुरू करा",
    "session complete!": "सत्र पूर्ण!",
    "great job investing your time!": "तुमचा वेळ गुंतवल्याबद्दल उत्तम काम!",
    "return home": "मुख्य पानावर परता",
    "performance by phase": "टप्प्यानुसार कामगिरी",
    "warm-up": "वॉर्म-अप",
    "core practice": "मुख्य सराव",
    "cool-down": "कूल-डाउन",
    "🌱 warm-up": "🌱 वॉर्म-अप",
    "🧠 core": "🧠 मुख्य",
    "🧠 core practice": "🧠 मुख्य सराव",
    "✨ cool-down": "✨ कूल-डाउन",
    "target class level": "लक्ष्य इयत्ता पातळी",
    "all classes (mixed)": "सर्व इयत्ता (मिश्रित)",
    "class 1": "इयत्ता 1",
    "class 2": "इयत्ता 2",
    "class 3": "इयत्ता 3",
    "class 4": "इयत्ता 4",
    "class 5": "इयत्ता 5",
    "class 6": "इयत्ता 6",
    "class 7": "इयत्ता 7",
    "class 8": "इयत्ता 8",
    "class 9": "इयत्ता 9",
    "class 10": "इयत्ता 10",
    "class 11": "इयत्ता 11",
    "class 12": "इयत्ता 12",
    "💡 learning explanation": "💡 शिकण्याचे स्पष्टीकरण",
    "skip & learn": "वगळा आणि शिका"
  },
  te: {
    "addition": "కూడిక",
    "practice addition!": "కూడిక ప్రాక్టీస్ చేయండి!",
    "choose a level and solve addition questions": "ఒక స్థాయిని ఎంచుకుని కూడిక ప్రశ్నలను పరిష్కరించండి",
    "easy — 1 digit": "సులభం — 1 అంకె",
    "medium — 2 digits": "మధ్యస్థం — 2 అంకెలు",
    "hard — 3 digits": "కష్టం — 3 అంకెలు",
    "extra hard — 4 digits": "చాలా కష్టం — 4 అంకెలు",
    "adaptive": "అడాప్టివ్",
    "how many questions?": "ఎన్ని ప్రశ్నలు?",
    "start quiz": "క్విజ్ ప్రారంభించు",
    "finish quiz": "క్విజ్ ముగించు",
    "next question": "తదుపరి ప్రశ్న",
    "subtraction": "తీసివేత",
    "practice subtraction!": "తీసివేత ప్రాక్టీస్ చేయండి!",
    "multiplication": "గుణకారం",
    "practice multiplication!": "గుణకారం ప్రాక్టీస్ చేయండి!",
    "division": "భాగహారం",
    "practice division!": "భాగహారం ప్రాక్టీస్ చేయండి!",
    "number bases": "సంఖ్యా ఆధారాలు",
    "binary, decimal, hexadecimal": "బైనరీ, డెసిమల్, హెక్సాడెసిమల్",
    "easy — dec→bin": "సులభం — డెసిమల్→బైనరీ",
    "medium — bin→dec": "మధ్యస్థం — బైనరీ→డెసిమల్",
    "hard — dec→hex": "కష్టం — డెసిమల్→హెక్సా",
    "extra hard — bin add / hex→bin": "చాలా కష్టం — బైనరీ కూడిక / హెక్సా→బైనరీ",
    "starts easy and smoothly adjusts to your level as you answer.": "సులభంగా ప్రారంభమవుతుంది మరియు మీరు సమాధానం ఇస్తున్నప్పుడు మీ స్థాయికి సజావుగా సర్దుబాటు అవుతుంది.",
    "session optimizer": "సెషన్ ఆప్టిమైజర్",
    "smart practice built for your schedule": "మీ షెడ్యూల్ కోసం రూపొందించబడిన స్మార్ట్ ప్రాక్టీస్",
    "how much time do you have today?": "ఈరోజు మీ వద్ద ఎంత సమయం ఉంది?",
    "your 15-minute session plan:": "మీ 15-నిమిషాల సెషన్ ప్లాన్:",
    "your 30-minute session plan:": "మీ 30-నిమిషాల సెషన్ ప్లాన్:",
    "your 45-minute session plan:": "మీ 45-నిమిషాల సెషన్ ప్లాన్:",
    "your 60-minute session plan:": "మీ 60-నిమిషాల సెషన్ ప్లాన్:",
    "start session": "సెషన్ ప్రారంభించు",
    "session complete!": "సెషన్ పూర్తయింది!",
    "great job investing your time!": "మీ సమయాన్ని పెట్టుబడి పెట్టినందుకు గొప్ప పని!",
    "return home": "హోమ్‌కు తిరిగి వెళ్ళు",
    "performance by phase": "దశలవారీగా పనితీరు",
    "warm-up": "వార్మ్-అప్",
    "core practice": "ప్రధాన అభ్యాసం",
    "cool-down": "కూల్-డౌన్",
    "🌱 warm-up": "🌱 వార్మ్-అప్",
    "🧠 core": "🧠 ప్రధాన",
    "🧠 core practice": "🧠 ప్రధాన అభ్యాసం",
    "✨ cool-down": "✨ కూల్-డౌన్",
    "target class level": "లక్ష్య తరగతి స్థాయి",
    "all classes (mixed)": "అన్ని తరగతులు (మిశ్రమ)",
    "class 1": "తరగతి 1",
    "class 2": "తరగతి 2",
    "class 3": "తరగతి 3",
    "class 4": "తరగతి 4",
    "class 5": "తరగతి 5",
    "class 6": "తరగతి 6",
    "class 7": "తరగతి 7",
    "class 8": "తరగతి 8",
    "class 9": "తరగతి 9",
    "class 10": "తరగతి 10",
    "class 11": "తరగతి 11",
    "class 12": "తరగతి 12",
    "💡 learning explanation": "💡 అభ్యాస వివరణ",
    "skip & learn": "వదిలేసి నేర్చుకోండి"
  },
  bn: {
    "addition": "যোগ",
    "practice addition!": "যোগ অনুশীলন করুন!",
    "choose a level and solve addition questions": "একটি স্তর চয়ন করুন এবং যোগ প্রশ্নগুলি সমাধান করুন",
    "easy — 1 digit": "সহজ — 1 অঙ্ক",
    "medium — 2 digits": "মাঝারি — 2 অঙ্ক",
    "hard — 3 digits": "কঠিন — 3 অঙ্ক",
    "extra hard — 4 digits": "খুব কঠিন — 4 অঙ্ক",
    "adaptive": "অভিযোজিত",
    "how many questions?": "কতগুলি প্রশ্ন?",
    "start quiz": "কুইজ শুরু করুন",
    "finish quiz": "কুইজ শেষ করুন",
    "next question": "পরবর্তী প্রশ্ন",
    "subtraction": "বিয়োগ",
    "practice subtraction!": "বিয়োগ অনুশীলন করুন!",
    "multiplication": "গুণ",
    "practice multiplication!": "গুণ অনুশীলন করুন!",
    "division": "ভাগ",
    "practice division!": "ভাগ অনুশীলন করুন!",
    "number bases": "সংখ্যার ভিত্তি",
    "binary, decimal, hexadecimal": "বাইনারি, দশমিক, হেক্সাডেসিমাল",
    "easy — dec→bin": "সহজ — দশমিক→বাইনারি",
    "medium — bin→dec": "মাঝারি — বাইনারি→দশমিক",
    "hard — dec→hex": "কঠিন — দশমিক→হেক্সা",
    "extra hard — bin add / hex→bin": "খুব কঠিন — বাইনারি যোগ / হেক্সা→বাইনারি",
    "starts easy and smoothly adjusts to your level as you answer.": "সহজভাবে শুরু হয় এবং উত্তর দেওয়ার সাথে সাথে আপনার স্তরের সাথে মসৃণভাবে সামঞ্জস্য হয়।",
    "session optimizer": "সেশন অপ্টিমাইজার",
    "smart practice built for your schedule": "আপনার সময়সূচীর জন্য তৈরি স্মার্ট অনুশীলন",
    "how much time do you have today?": "আজ আপনার কাছে কত সময় আছে?",
    "your 15-minute session plan:": "আপনার 15-মিনিটের সেশন পরিকল্পনা:",
    "your 30-minute session plan:": "আপনার 30-মিনিটের সেশন পরিকল্পনা:",
    "your 45-minute session plan:": "আপনার 45-মিনিটের সেশন পরিকল্পনা:",
    "your 60-minute session plan:": "আপনার 60-মিনিটের সেশন পরিকল্পনা:",
    "start session": "সেশন শুরু করুন",
    "session complete!": "সেশন সম্পূর্ণ!",
    "great job investing your time!": "আপনার সময় বিনিয়োগ করার জন্য দুর্দান্ত কাজ!",
    "return home": "হোমে ফিরে যান",
    "performance by phase": "পর্যায় অনুযায়ী পারফরম্যান্স",
    "warm-up": "ওয়ার্ম-আপ",
    "core practice": "মূল অনুশীলন",
    "cool-down": "কুল-ডাউন",
    "🌱 warm-up": "🌱 ওয়ার্ম-আপ",
    "🧠 core": "🧠 মূল",
    "🧠 core practice": "🧠 মূল অনুশীলন",
    "✨ cool-down": "✨ কুল-ডাউন",
    "target class level": "লক্ষ্য ক্লাস স্তর",
    "all classes (mixed)": "সমস্ত ক্লাস (মিশ্র)",
    "class 1": "ক্লাস 1",
    "class 2": "ক্লাস 2",
    "class 3": "ক্লাস 3",
    "class 4": "ক্লাস 4",
    "class 5": "ক্লাস 5",
    "class 6": "ক্লাস 6",
    "class 7": "ক্লাস 7",
    "class 8": "ক্লাস 8",
    "class 9": "ক্লাস 9",
    "class 10": "ক্লাস 10",
    "class 11": "ক্লাস 11",
    "class 12": "ক্লাস 12",
    "💡 learning explanation": "💡 শেখার ব্যাখ্যা",
    "skip & learn": "এড়িয়ে যান এবং শিখুন"
  }
};

export function AutoTranslator() {
  const { locale, translations } = useI18n();
  const [enToCurrent, setEnToCurrent] = useState({});
  const enToCurrentRef = useRef({});

  useEffect(() => {
    if (locale === 'en' || !translations) {
      setEnToCurrent({});
      enToCurrentRef.current = {};
      return;
    }
    const map = {};
    for (const key in en) {
      if (typeof en[key] === 'string' && typeof translations[key] === 'string') {
        map[en[key].trim().toLowerCase()] = translations[key];
      }
    }
    setEnToCurrent(map);
    enToCurrentRef.current = map;
  }, [locale, translations]);

  useEffect(() => {
    if (locale === 'en') return;

    function translateText(text) {
      if (!text || !text.trim()) return text;
      const lower = text.trim().toLowerCase();
      
      const dict = enToCurrentRef.current;
      const currentExtraDict = extraDicts[locale] || {};
      
      // Exact match from dynamic translations
      if (dict[lower]) return text.replace(text.trim(), dict[lower]);
      
      // Exact match from currentExtraDict
      if (currentExtraDict[lower]) return text.replace(text.trim(), currentExtraDict[lower]);
      
      // Fallback: replace known strings within the text
      let replaced = text;
      
      // Sort keys by length descending to match longer phrases first
      const allKeys = [...Object.keys(dict), ...Object.keys(currentExtraDict)]
        .filter(k => k.length >= 2)
        .sort((a, b) => b.length - a.length);
        
      for (const enKey of allKeys) {
        if (replaced.toLowerCase().includes(enKey)) {
           const translatedText = dict[enKey] || currentExtraDict[enKey];
           // Use regex with word boundaries if it starts/ends with a letter
           const startBoundary = /^[a-z]/i.test(enKey) ? '\\b' : '';
           const endBoundary = /[a-z]$/i.test(enKey) ? '\\b' : '';
           const regex = new RegExp(`${startBoundary}${enKey.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}${endBoundary}`, 'gi');
           replaced = replaced.replace(regex, translatedText);
        }
      }
      
      // Regex dynamic match
      const dyn = translateDynamic(replaced, locale);
      if (dyn !== replaced) return dyn;
      
      return replaced;
    }

    const translateNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.parentElement && node.parentElement.closest('.no-translate, script, style')) return;
        const original = node.nodeValue;
        if (original && original.trim() && /[a-zA-Z]/.test(original)) {
          const translated = translateText(original);
          if (translated !== original) {
            node.nodeValue = translated;
          } else {
            // Async fallback for unknown English text
            const trimmed = original.trim();
            const cacheKey = `gtx_trans_${locale}_${trimmed}`;
            const cached = localStorage.getItem(cacheKey);
            
            if (cached) {
              node.nodeValue = original.replace(trimmed, cached);
            } else {
              if (!window.pendingTrans) window.pendingTrans = {};
              if (!window.pendingTrans[cacheKey]) {
                window.pendingTrans[cacheKey] = fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${locale}&dt=t&q=${encodeURIComponent(trimmed)}`)
                  .then(r => r.json())
                  .then(data => {
                    const resText = data[0].map(item => item[0]).join('');
                    localStorage.setItem(cacheKey, resText);
                    return resText;
                  }).catch(e => trimmed);
              }
              window.pendingTrans[cacheKey].then(resText => {
                // Ensure the node hasn't been modified by React while we were fetching
                if (resText && resText !== trimmed && node.nodeValue === original) {
                  if (observerRef.current) observerRef.current.disconnect();
                  node.nodeValue = original.replace(trimmed, resText);
                  if (observerRef.current) observerRef.current.observe(document.body, { childList: true, subtree: true, characterData: true });
                }
              });
            }
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.matches('.no-translate, script, style')) return;
        // Translate placeholders
        if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
          const ph = node.getAttribute('placeholder');
          if (ph && /[a-zA-Z]/.test(ph)) {
            const tph = translateText(ph);
            if (tph !== ph) {
              node.setAttribute('placeholder', tph);
            } else {
              const cacheKey = `gtx_trans_${locale}_${ph}`;
              const cached = localStorage.getItem(cacheKey);
              if (cached) {
                node.setAttribute('placeholder', cached);
              } else {
                if (!window.pendingTrans) window.pendingTrans = {};
                if (!window.pendingTrans[cacheKey]) {
                  window.pendingTrans[cacheKey] = fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${locale}&dt=t&q=${encodeURIComponent(ph)}`)
                    .then(r => r.json())
                    .then(data => {
                      const resText = data[0].map(item => item[0]).join('');
                      localStorage.setItem(cacheKey, resText);
                      return resText;
                    }).catch(e => ph);
                }
                window.pendingTrans[cacheKey].then(resText => {
                  if (resText && resText !== ph && node.getAttribute('placeholder') === ph) {
                    node.setAttribute('placeholder', resText);
                  }
                });
              }
            }
          }
        }
        node.childNodes.forEach(translateNode);
      }
    };

    const observerRef = { current: null };

    // Initial translation
    translateNode(document.body);

    // Watch for dynamic updates
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.type === 'childList') {
          m.addedNodes.forEach(node => translateNode(node));
        } else if (m.type === 'characterData') {
          // If React updates a text node with English, translate it back
          const node = m.target;
          if (node.nodeType === Node.TEXT_NODE) {
             const original = node.nodeValue;
             if (original && original.trim() && /[a-zA-Z]/.test(original)) {
               const translated = translateText(original);
               if (translated !== original) {
                 observerRef.current.disconnect();
                 node.nodeValue = translated;
                 observerRef.current.observe(document.body, { childList: true, subtree: true, characterData: true });
               } else {
                 // Trigger async fallback for dynamic text updates
                 const trimmed = original.trim();
                 const cacheKey = `gtx_trans_${locale}_${trimmed}`;
                 const cached = localStorage.getItem(cacheKey);
                 if (cached) {
                   observerRef.current.disconnect();
                   node.nodeValue = original.replace(trimmed, cached);
                   observerRef.current.observe(document.body, { childList: true, subtree: true, characterData: true });
                 } else {
                   if (!window.pendingTrans) window.pendingTrans = {};
                   if (!window.pendingTrans[cacheKey]) {
                     window.pendingTrans[cacheKey] = fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${locale}&dt=t&q=${encodeURIComponent(trimmed)}`)
                       .then(r => r.json())
                       .then(data => {
                         const resText = data[0].map(item => item[0]).join('');
                         localStorage.setItem(cacheKey, resText);
                         return resText;
                       }).catch(e => trimmed);
                   }
                   window.pendingTrans[cacheKey].then(resText => {
                     if (resText && resText !== trimmed && node.nodeValue === original) {
                       observerRef.current.disconnect();
                       node.nodeValue = original.replace(trimmed, resText);
                       observerRef.current.observe(document.body, { childList: true, subtree: true, characterData: true });
                     }
                   });
                 }
               }
             }
          }
        }
      });
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observerRef.current && observerRef.current.disconnect();
  }, [locale]);

  return null;
}
