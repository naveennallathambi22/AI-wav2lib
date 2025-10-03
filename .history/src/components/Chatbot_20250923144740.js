import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Chatbot.css';

const Chatbot = ({ 
  embedded = false, 
  onSpeakingChange = () => {},
  onUserInteraction = () => {},
  onChatReset = () => {},
  onAddBotMessage = () => {},
  onLanguageChange = () => {},
  onVideoChange = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  // Get sample questions based on selected language
  const getSampleQuestions = (language) => {
    const sampleQuestions = {
      en: [
        "What are the school timings?",
        "Who is founder of Macro Vision Academy?",
        "Tell me about the admission process",
        "What facilities are available?",
        "Tell me about hostel life?"
      ],
      hi: [
        "स्कूल का समय क्या है?",
        "मैं स्कूल से कैसे संपर्क कर सकता हूँ?",
        "प्रवेश प्रक्रिया के बारे में बताएं",
        "फीस कितनी है?",
        "कौन सी सुविधाएं उपलब्ध हैं?",
        "प्रवेश के लिए आवेदन कैसे करें?"
      ],
      mr: [
        "शाळेचे वेळापत्रक काय आहे?",
        "मी शाळेशी कसं संपर्क साधू शकतो?",
        "प्रवेश प्रक्रियेबद्दल सांगा",
        "फी किती आहे?",
        "कोणत्या सुविधा उपलब्ध आहेत?",
        "प्रवेशासाठी अर्ज कसा करावा?"
      ]
    };
    return sampleQuestions[language] || sampleQuestions.en;
  };
  
  const messagesEndRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const dropdownRef = useRef(null);

  // Multilingual UI text
  const getUIText = (selectedLanguage) => {
    const uiTexts = {
      en: {
        tryAsking: "Try asking:",
        typePlaceholder: "Type your question...",
        listening: "Listening...",
        clearChat: "Clear Chat",
        send: "Send",
        chatbotAssistant: "VisionXpert",
        chatbotSubtitle: "Ask anything about the school",
        greeting: "Hello!How can I assist you today?"
      },
      hi: {
        tryAsking: "पूछने की कोशिश करें:",
        typePlaceholder: "अपना प्रश्न टाइप करें...",
        listening: "सुन रहा हूँ...",
        clearChat: "चैट साफ़ करें",
        send: "भेजें",
        chatbotAssistant: "स्कूल सहायक",
        chatbotSubtitle: "स्कूल के बारे में कुछ भी",
        greeting: "नमस्ते! मैं आपका स्कूल सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?"
      },
      mr: {
        tryAsking: "विचारण्याचा प्रयत्न करा:",
        typePlaceholder: "तुमचा प्रश्न टाइप करा...",
        listening: "ऐकत आहे...",
        clearChat: "चैट साफ करा",
        send: "पाठवा",
        chatbotAssistant: "शाळा सहाय्यक",
        chatbotSubtitle: "शाळेबद्दल काहीही",
        greeting: "नमस्कार! मी तुमचा शाळा सहाय्यक आहे। आज मी तुम्हाला कशी मदत करू शकतो?"
      }
    };
    return uiTexts[selectedLanguage] || uiTexts.en;
  };

  const chatbotData = [
  {
    "question": "School Timings",
    "video": "eng1.mp4",
    "answer": {
      "English": "Our school timings are from 8:00 AM to 3:00 PM, Monday to Saturday.",
      "Hindi": "हमारा स्कूल सुबह 8 बजे से शाम 3 बजे तक चलता है, सोमवार से शनिवार।",
      "Marathi": "आमची शाळा सकाळी 8 ते दुपारी 3 पर्यंत चालते, सोमवार ते शनिवार."
    },
    "aliases": [
      "school timings", "school time", "timing", "timings", "school hours", "hours", "when does school start", "when does school end", "school schedule", "opening time", "closing time", "working hours",
      "स्कूल का समय", "स्कूल कब खुलता है", "स्कूल समय", "समय", "खुलने का समय", "बंद होने का समय", "समय सारिणी",
      "शाळेचा वेळ", "शाळा कधी सुरू होते?", "शाळेचे तास", "वेळापत्रक", "कामाचे तास"
    ]
  },
  {
    "question": "Contact School",
    "video": "eng2.mp4",
    "answer": {
      "English": "You can contact us at +91 9302511111 during working hours.",
      "Hindi": "आप हमें +91 9302511111 पर संपर्क कर सकते हैं।",
      "Marathi": "आपण आमच्याशी संपर्क साधू शकता +91 9302511111 या नंबरवर."
    },
    "aliases": [
      "contact number", "contact", "phone", "phone number", "mobile", "mobile number", "call", "how to contact school", "school contact", "support", "helpdesk", "email", "call us",
      "फोन नंबर", "संपर्क नंबर", "मोबाइल नंबर", "संपर्क क्रमांक", "मैं स्कूल से कैसे संपर्क कर सकता हूँ?", "बात करना", "ईमेल",
      "फोन नंबर काय आहे?", "संपर्क साधा", "फोन करा"
    ]
  },
  {
    "question": "Admission Process",
    "video": "eng3.mp4",
    "answer": {
      "English": "Yo   u can apply for admission by visiting our admissions office or our website.",
      "Hindi": "आप हमारे प्रवेश कार्यालय या वेबसाइट पर जाकर आवेदन कर सकते हैं।",
      "Marathi": "आपण प्रवेश कार्यालय किंवा आमच्या वेबसाइटवर जाऊन अर्ज करू शकता."
    },
    "aliases": [
      "admission process", "admission", "apply for admission", "how to apply", "how to join school", "enroll", "enrollment process", "application", "get into school", "joining process",
      "प्रवेश प्रक्रिया", "कैसे आवेदन करें", "एडमिशन", "आवेदन कैसे करें", "प्रवेश",
      "प्रवेश कसा घ्यावा?", "अ‍ॅडमिशन कसा करायचा?", "शाळेत कसे प्रवेश घ्यायचे?", "अर्ज कसा करावा"
    ]
  },
  {                                
    "question": "Fees",
    "video": "eng21.mp4",
    "answer": {
      "English": "You can find fee details on the school's official website or contact the accounts office.",
      "Hindi": "आप स्कूल की आधिकारिक वेबसाइट पर शुल्क विवरण पा सकते हैं या लेखा कार्यालय से संपर्क कर सकते हैं।",
      "Marathi": "तुम्ही शाळेच्या अधिकृत वेबसाइटवर फी तपशील शोधू शकता किंवा लेखा कार्यालयाशी संपर्क साधू शकता."
    },
    "aliases": [
      "fees", "fee structure", "tuition fees", "cost", "price", "school fees", "how much does it cost", "fee details",
      "फीस", "फीस कितनी है", "स्कूल की फीस", "खर्च",
      "फी", "शाळेची फी", "खर्च किती आहे"
    ]
  },
  {
    "question": "Founder",
    "video": "eng4.mp4",
    "answer": {
      "English": "Our founder is Mr. Anand Prakash Chouksey.",
      "Hindi": "हमारे संस्थापक श्री आनंद प्रकाश चौकसे हैं।",
      "Marathi": "आमचे संस्थापक श्री. आनंद प्रकाश चौकसे आहेत."
    },
    "aliases": [
      "founder", "who is the founder", "founder name", "school founder", "established by", "school established by", "creator", "who started the school", "founder's name",
      "संस्थापक कौन हैं?", "संस्थापक का नाम", "किसने शुरू किया", "संस्थापक",
      "संस्था स्थापक कोण आहेत?", "शाळेचे संस्थापक कोण?", "स्थापक", "कोणी शाळा सुरू केली"
    ]
  },
  {
    "question": "Principal",
    "video": "eng5.mp4",
    "answer": {
      "English": "Our principal is Mr. J. S. Parmar.",
      "Hindi": "हमारे प्रधानाचार्य श्री जे. एस. परमार हैं।",
      "Marathi": "आमचे प्राचार्य श्री. जे. एस. परमार आहेत."
    },
    "aliases": [
      "principal", "who is the principal", "principal name", "school principal", "head of school", "headmaster", "headmistress", "school head",
      "प्रधानाचार्य कौन हैं?", "मुख्याध्यापक का नाम", "प्रधानाचार्य", "स्कूल का मुखिया",
      "प्राचार्य कोण आहे?", "शाळेचे प्राचार्य कोण?", "मुख्याध्यापक"
    ]
  },
  {
    "question": "School Board",
    "video": "eng6.mp4",
    "answer": {
      "English": "Macro Vision Academy is affiliated with the CBSE, New Delhi.",
      "Hindi": "मैक्रो विज़न एकेडमी सीबीएसई से संबंधित है।",
      "Marathi": "मॅक्रो व्हिजन अकॅडमी सीबीएसईशी संलग्न आहे."
    },
    "aliases": [
      "school board", "board", "affiliation", "which board", "cbse", "affiliated to", "education board", "curriculum board",
      "स्कूल बोर्ड", "बोर्ड", "किस बोर्ड से जुड़ा है", "संलग्न", "सीबीएसई",
      "शाळा मंडळ", "मंडळ", "कोणत्या बोर्डाशी संलग्न आहे"
    ]
  },
  {
    "question": "Classes Offered",
    "video": "eng7.mp4",
    "answer": {
      "English": "Education is provided from Class I to Class XII.",
      "Hindi": "कक्षा I से XII तक शिक्षा प्रदान की जाती है।",
      "Marathi": "क्लास I ते XII पर्यंत शिक्षण दिले जाते."
    },
    "aliases": [
      "classes offered", "classes", "which classes", "grades offered", "grade range", "from which class to which class", "education level", "standards", "which grades",
      "कौन से कक्षाएँ", "क्लासेस", "कक्षाएं कौन से हैं", "कौन-कौन सी क्लास है",
      "शाळेत कोणते वर्ग आहेत", "इयत्ता", "वर्ग", "कोणते वर्ग"
    ]
  },
  {
    "question": "Campus Size",
    "video": "eng8.mp4",
    "answer": {
      "English": "The academy is spread over approximately 50 acres on the outskirts of Burhanpur.",
      "Hindi": "यह स्कूल बुरहानपुर के बाहरी इलाके में लगभग 50 एकड़ में फैला है।",
      "Marathi": "हे शाळेचे परिसर बुरहानपूरच्या बाहेरील भागात सुमारे 50 एकरात पसरले आहे."
    },
    "aliases": [
      "campus size", "campus", "area", "how big is the campus", "school area", "school campus", "land area", "size of school", "acres",
      "कैंपस का आकार", "एरिया", "कितना बड़ा है", "क्षेत्रफल",
      "शाळेचा परिसर", "परिसर", "क्षेत्रफळ", "किती मोठी आहे"
    ]
  },
  {
    "question": "School Safety",
    "video": "eng9.mp4",
    "answer": {
      "English": "We follow strict safety protocols including CCTV, security guards, and visitor logs.",
      "Hindi": "हम कड़े सुरक्षा प्रोटोकॉल का पालन करते हैं जिसमें सीसीटीवी, सुरक्षा गार्ड और विज़िटर लॉग शामिल हैं।",
      "Marathi": "आम्ही कडक सुरक्षा उपाय योजना वापरतो ज्यात सीसीटीव्ही, सुरक्षा रक्षक आणि भेटीची नोंद समाविष्ट आहे."
    },
    "aliases": [
      "school safety", "safety", "is school safe", "security", "child safety", "safety measures", "cctv", "security guards", "secure", "safe for children",
      "स्कूल सुरक्षा", "सुरक्षा", "क्या स्कूल सुरक्षित है", "सुरक्षा उपाय", "बच्चों की सुरक्षा", "सीसीटीवी",
      "शाळा सुरक्षा", "सुरक्षितता", "शाळा सुरक्षित आहे का", "सुरक्षेची काळजी"
    ]
  },
  {
    "question": "Library Timings",
    "video": "eng10.mp4",
    "answer": {
      "English": "The school library is open from 9 AM to 4 PM on all working days.",
      "Hindi": "स्कूल पुस्तकालय सभी कार्यदिवसों में सुबह 9 बजे से शाम 4 बजे तक खुला रहता है।",
      "Marathi": "शाळेचे ग्रंथालय सर्व कार्यदिवस सकाळी 9 ते सायंकाळी 4 पर्यंत उघडे असते."
    },
    "aliases": [
      "library", "library timings", "library hours", "books", "reading", "library time", "school library", "reading room", "access to books",
      "पुस्तकालय", "पुस्तकालय का समय", "लाइब्रेरी", "किताबें", "वाचनालय",
      "ग्रंथालय", "शाळेचे पुस्तकालय", "वाचनालय", "पुस्तके"
    ]
  },
  {
    "question": "Sports Facilities",
    "video": "eng11.mp4",
    "answer": {
      "English": "Our school has excellent sports facilities including cricket, football, and basketball.",
      "Hindi": "हमारे स्कूल में क्रिकेट, फुटबॉल और बास्केटबॉल सहित उत्कृष्ट खेल सुविधाएं हैं।",
      "Marathi": "आमच्या शाळेत क्रिकेट, फुटबॉल आणि बास्केटबॉलसह उत्कृष्ट क्रीडा सुविधा आहेत."
    },
    "aliases": [
      "sports", "sports facilities", "games", "playground", "athletics", "cricket", "football", "basketball", "physical education", "outdoor games", "indoor games",
      "खेल", "खेल सुविधाएं", "मैदान", "क्रीडा",
      "खेळ", "क्रीडा", "खेळाच्या सुविधा", "क्रीडा सुविधा", "मैदान"
    ]
  },
  {
    "question": "Mess / Food",
    "video": "eng12.mp4",
    "answer": {
      "English": "The school mess serves healthy meals from 10:00 AM to 2 PM.",
      "Hindi": "स्कूल मेस सुबह 10 बजे से दोपहर 2 बजे तक स्वस्थ भोजन परोसता है।",
      "Marathi": "शाळेचा मेस सकाळी 10 ते दुपारी 2 वाजेपर्यंत आरोग्यदायी जेवण देते."
    },
    "aliases": [
      "mess", "food", "canteen", "lunch", "meals", "mess timings", "cafeteria", "diet", "nutrition", "eating", "what food is served", "menu",
      "मेस", "खाना", "लंच", "कैंटीन", "भोजन", "खाने का समय",
      "शाळेचा मेस", "मेसचे वेळापत्रक", "जेवण", "खानावळ"
    ]
  },
  {
    "question": "Online Classes",
    "video": "eng13.mp4",
    "answer": {
      "English": "We provide online classes through our school portal and apps in case of remote learning needs.",
      "Hindi": "हम जरूरत पड़ने पर स्कूल पोर्टल और ऐप्स के माध्यम से ऑनलाइन कक्षाएं प्रदान करते हैं।",
      "Marathi": "गरज पडल्यास आम्ही आमच्या शाळेच्या पोर्टल आणि अॅप्सद्वारे ऑनलाइन वर्ग घेतो."
    },
    "aliases": [
      "online classes", "virtual classes", "digital learning", "e-learning", "remote classes", "online education", "study from home", "online portal", "school app",
      "ऑनलाइन कक्षा", "ऑनलाइन पढ़ाई", "ऑनलाइन शिक्षण", "व्हर्च्युअल क्लास", "डिजिटल लर्निंग", "घर से पढ़ाई",
      "ऑनलाइन शिक्षण", "व्हर्च्युअल क्लास", "डिजिटल लर्निंग", "घरून अभ्यास"
    ]
  },
  {
    "question": "Parent-Teacher Meetings",
    "video": "eng14.mp4",
    "answer": {
      "English": "Parent-teacher meetings are held at the end of each term. Schedule is notified in advance.",
      "Hindi": "अभिभावक-शिक्षक बैठक हर सत्र के अंत में होती है। कार्यक्रम पहले ही सूचित किया जाता है।",
      "Marathi": "पालक-शिक्षक बैठक प्रत्येक सत्राच्या शेवटी घेतली जाते. वेळापत्रक आधीच कळवले जाते."
    },
    "aliases": [
      "parent teacher meeting", "ptm", "parents meeting", "meeting with teacher", "parent conference", "pt meeting", "teacher interaction", "parent teacher association",
      "अभिभावक शिक्षक बैठक", "पीटीएम", "पालक शिक्षक बैठक", "टीचर से मिलना",
      "पालक शिक्षक बैठक", "टीचरसोबत बैठक", "अभिभावक बैठक"
    ]
  },
  {
    "question": "Extra-Curricular Activities",
    "video": "eng15.mp4",
    "answer": {
      "English": "We offer a range of activities including dance, drama, music, and robotics.",
      "Hindi": "हम नृत्य, नाटक, संगीत और रोबोटिक्स जैसी कई गतिविधियाँ प्रदान करते हैं।",
      "Marathi": "आम्ही नृत्य, नाट्य, संगीत आणि रोबोटिक्ससारख्या अनेक उपक्रमांची सुविधा देतो."
    },
    "aliases": [
      "extra curricular activities", "activities", "co-curricular","curricular","extra", "hobbies", "dance", "music", "drama", "art", "robotics", "clubs", "after school activities",
      "अतिरिक्त पाठ्यक्रम गतिविधियाँ", "गैर शैक्षणिक गतिविधियाँ", "शौक", "गतिविधियां",
      "अभ्यासेतर उपक्रम", "शाळेतील इतर उपक्रम", "छंद", "कला"
    ]
  },
  {
    "question": "Boarding Facilities",
    "video": "eng16.mp4",
    "answer": {
      "English": "MVA is a day-cum-boarding school with separate hostel wings for boys and girls.",
      "Hindi": "एमवीए डे-क्यूम-बोर्डिंग स्कूल है, जिसमें बालक और बालिका हेतु अलग हॉस्टल हैं।",
      "Marathi": "एमव्हीए डे-कॅम- बोर्डिंग शाळा आहे, जिथे मुलं आणि मुलींसाठी स्वतंत्र हॉस्टल आहेत."
    },
    "aliases": [
      "boarding", "hostel", "residential", "hostel facilities", "boarding school", "accommodation", "where to stay", "hostel life", "dormitory", "lodging",
      "होस्टल", "बोर्डिंग", "वसतिगृह", "छात्रावास", "निवासस्थान", "हॉस्टल सुविधा",
      "वसतिगृह", "हॉस्टेल", "बोर्डिंग", "निवासाची सोय"
    ]
  },
  {
    "question": "Medical Facilities",
    "video": "eng17.mp4",
    "answer": {
      "English": "We have our own hospital named 'All is Well' on campus with doctors available at all times.",
      "Hindi": "हमारे पास 'ऑल इज़ वेल' नामक हॉस्पिटल है, डॉक्टर हमेशा उपलब्ध हैं।",
      "Marathi": "आमचे स्वतःचे 'All is Well' नावाचे हॉस्पिटल शाळेच्या कॅम्पसमध्ये आहे, डॉक्टर नेहमी उपलब्ध आहेत."
    },
    "aliases": [
      "medical", "medical facilities", "doctor", "hospital", "first aid", "healthcare", "nurse", "clinic", "health services", "emergency", "sick room",
      "मेडिकल", "डॉक्टर", "हॉस्पिटल", "प्राथमिक चिकित्सा", "स्वास्थ्य सेवा", "नर्स", "दवाखाना",
      "वैद्यकीय सुविधा", "डॉक्टर", "रुग्णालय", "प्रथमोपचार"
    ]
  },
  {
    "question": "Technology Program",
    "video": "eng18.mp4",
    "answer": {
      "English": "MVA uses iPads, iMac labs, high-speed Wi-Fi, and AV teaching tools for digital learning.",
      "Hindi": "एमवीए iPads, iMac लैब, हाई-स्पीड Wi-Fi और AV टूल्स का उपयोग डिजिटल शिक्षण के लिए करता है।",
      "Marathi": "एमव्हीए iPads, iMac Labs, उच्च-गती Wi-Fi, आणि AV साधनांचा वापर डिजिटल शिक्षणासाठी करतो."
    },
    "aliases": [
      "technology", "technology program", "digital tools", "ipad", "imac", "wi-fi", "digital learning", "av tools", "smart classes", "it", "computers", "tech integration",
      "टेक्नोलॉजी", "डिजिटल टूल्स", "आईपैड", "डिजिटल लर्निंग", "स्मार्ट क्लास", "कंप्यूटर",
      "तंत्रज्ञान", "स्मार्ट क्लासेस", "डिजिटल शिक्षण", "कॉम्प्युटर"
    ]
  },
  {
    "question": "Holiday List",
    "video": "eng19.mp4",
    "answer": {
      "English": "Our holiday list is available on the school website under 'Calendar'.",
      "Hindi": "हमारी छुट्टियों की सूची स्कूल वेबसाइट पर 'Calendar' में उपलब्ध है।",
      "Marathi": "आमच्या सुट्ट्यांची यादी शाळेच्या वेबसाइटवर 'Calendar' मध्ये उपलब्ध आहे."
    },
    "aliases": [
      "holiday list", "holidays","holiday", "school holidays", "vacations", "calendar", "holiday schedule", "when is holiday", "no school days", "academic calendar",
      "छुट्टियाँ", "छुट्टी की सूची", "विद्यालय की छुट्टियाँ", "कैलेंडर", "अवकाश",
      "सुट्ट्यांची यादी", "सुट्ट्या", "कॅलेंडर", "शाळेला सुट्टी"
    ]
  },
  {
    "question": "School Address",
    "video": "eng20.mp4",
    "answer": {
      "English": "Post Box No.12, Renuka Mata Road, Behind Collectorate, Burhanpur, MP 450331.",
      "Hindi": "पोस्ट बॉक्स नंबर 12, रेणुका माता रोड, कलेक्टोरेट के पीछे, बुरहानपुर, MP 450331.",
      "Marathi": "पोस्ट बॉक्स नं. 12, रेणुका माता रोड, कलेक्टर कार्यालयाच्या मागे, बुरहानपूर, MP 450331."
    },
    "aliases": [
      "school address", "address", "location", "where is school", "school location", "how to reach school", "school map", "directions", "find school", "physical address",
      "स्कूल का पता", "पता", "लोकेशन", "जगह", "कैसे पहुंचें",
      "शाळा पत्ता", "शाळेचा पत्ता", "पत्ता", "ठिकाण", "कसे पोहोचावे"
    ]
  },
  {
    "question": "Greetings",
    "video": "eng22.mp4",
    "aliases": [
      "hello",
      "hi",
      "hey",
      "good morning",
      "morning",
      "good afternoon",
      "afternoon",
      "good evening",
      "evening"
    ],
    "answer": {
      "English": "Hello! How can I help you today?",
      "Hindi": "नमस्ते! मैं आपकी किस प्रकार मदद कर सकती हूँ?",
      "Marathi": "नमस्कार! मी तुम्हाला कशी मदत करू शकते?"
    }
  }
];

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Clear chat history on page load for a fresh start
    localStorage.removeItem('chatHistory');
    
    // Set initial messages
    setMessages([]);
    
    // Show sample questions for the default language
    const languageQuestions = getSampleQuestions(selectedLanguage);
    setSuggestions(languageQuestions.slice(0, 3));
  }, []);

  // Update suggestions when language changes
  useEffect(() => {
    const languageQuestions = getSampleQuestions(selectedLanguage);
    setSuggestions(languageQuestions.slice(0, 3));
  }, [selectedLanguage]);

  useEffect(() => {
    scrollToBottom();
    // Note: No longer saving to localStorage for fresh chat on every refresh
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addUserMessage = (message) => {
    const newMessage = { text: message, sender: 'user', timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, newMessage]);
  };

  const addBotMessage = (message) => {
    const newMessage = { text: message, sender: 'bot', timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, newMessage]);
  };

  // Expose addBotMessage function to parent component
  useEffect(() => {
    onAddBotMessage(addBotMessage);
  }, [onAddBotMessage]);

  // Notify parent component of language changes
  useEffect(() => {
    onLanguageChange(selectedLanguage);
  }, [selectedLanguage, onLanguageChange]);

  function getAnswer(userInput, chatbotData) {
    userInput = userInput.toLowerCase(); // normalize input
    
    // Find text answer and corresponding video in one go
    for (const item of chatbotData) {
      for (const alias of item.aliases) {
        if (userInput.includes(alias.toLowerCase())) {
          return {
            answer: item.answer, // Return the whole answer object { English, Hindi, Marathi }
            video: item.video
          };
        }
      }
    }
    
    // If no match is found, return a default response with sorry_reply.mp4
    return {
      answer: {
        English: "Sorry, I didn't understand that.",
        Hindi: "मुझे समझ नहीं आया।",
        Marathi: "मला समजलं नाही."
      },
      video: "/sorry_reply.mp4"
    };
  }

  const formatAnswer = (answerObj) => {
    if (!answerObj) {
        return "Sorry, I can't answer that right now.";
    }
    if (selectedLanguage === 'hi') return answerObj.Hindi || answerObj.English;
    if (selectedLanguage === 'mr') return answerObj.Marathi || answerObj.English;
    return answerObj.English; // Default to English
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Track user interaction
    onUserInteraction();
    
    addUserMessage(input);
    setInput('');
    setSuggestions([]);
    setIsTyping(true);
    
    // Use getAnswer - now returns object with answer and video
    const response = getAnswer(input, chatbotData);
    const formattedAnswer = formatAnswer(response.answer);
    
    setTimeout(() => {
      addBotMessage(formattedAnswer);
      speak(formattedAnswer, response.video);
      setIsTyping(false);
      setSuggestions(getRandomSuggestions());
    }, 800);
  };

  const getRandomSuggestions = () => {
    const languageQuestions = getSampleQuestions(selectedLanguage);
    const shuffled = [...languageQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current.focus();
  };

  const speak = (text, videoFile) => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any ongoing speech
    try { window.speechSynthesis.cancel(); } catch (e) {}

    const utterance = new SpeechSynthesisUtterance();
    const voices = window.speechSynthesis.getVoices();
    
    utterance.text = text;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    // Find a specific voice and use it consistently.
    const preferredVoice = voices.find(v => v.name === 'Google UK English Female'); // Example: Using a specific Google voice
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    } else {
      // Fallback to a generic Indian female voice if the preferred one is not available
      const indianFemaleVoice = voices.find(v =>
        v.lang.includes('IN') &&
        (v.gender === 'female' || v.name.toLowerCase().includes('female'))
      ) || voices.find(v => v.lang.includes('IN'));
      utterance.voice = indianFemaleVoice;
    }

    // Set language for TTS engine
    if (selectedLanguage === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (selectedLanguage === 'mr') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    // Wire speaking state for avatar switching   
    utterance.onstart = () => {
      try { 
        onVideoChange(videoFile); // Pass video file to App
        onSpeakingChange(true); 
      } catch (e) {}
    };
    const endSpeaking = () => {
      try { onSpeakingChange(false); } catch (e) {}
    };
    utterance.onend = endSpeaking;
    utterance.onerror = endSpeaking;
    utterance.onpause = endSpeaking;

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addBotMessage("Speech recognition is not supported in your browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = selectedLanguage === 'hi' ? 'hi-IN' : 
                                 selectedLanguage === 'mr' ? 'mr-IN' : 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setInput("Listening...");
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      inputRef.current.focus();
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      setInput("");
      addBotMessage("Sorry, I couldn't understand you. Please try typing your question.");
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (input === "Listening...") setInput("");
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
      // Call the reset handler to trigger voice greeting
      onChatReset();
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLanguageSelect = (lang) => {
    // Stop any ongoing speech when language changes
    try { window.speechSynthesis.cancel(); } catch (e) {}
    try { onSpeakingChange(false); } catch (e) {}
    setSelectedLanguage(lang);
    setIsDropdownOpen(false);
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''} ${embedded ? 'embedded' : ''}`}>
      <button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 11H5M12 19l-7-7 7-7"/>
          </svg>
        ) : (
          <div className="chatbot-avatar">
            {/* Avatar placeholder */}
          </div>
        )}
      </button>
      
      {(embedded || isOpen) && (
        <div className="chatbot-content">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <h3>{getUIText(selectedLanguage).chatbotAssistant}</h3>
              <div className="chatbot-subtitle">{getUIText(selectedLanguage).chatbotSubtitle}</div>
            </div>
            <div className="chatbot-controls">
              <div className="language-dropdown" ref={dropdownRef}>
                <button 
                  className="dropdown-toggle"
                  onClick={toggleDropdown}
                  aria-label="Select language"
                  aria-expanded={isDropdownOpen}
                >
                  {selectedLanguage === 'en' && '🇬🇧 English'}
                  {selectedLanguage === 'hi' && '🇮🇳 Hindi'}
                  {selectedLanguage === 'mr' && '🇮🇳 Marathi'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <button onClick={() => handleLanguageSelect('en')} className={selectedLanguage === 'en' ? 'active' : ''}>
                      🇬🇧 English
                    </button>
                    <button onClick={() => handleLanguageSelect('hi')} className={selectedLanguage === 'hi' ? 'active' : ''}>
                      🇮🇳 Hindi
                    </button>
                    <button onClick={() => handleLanguageSelect('mr')} className={selectedLanguage === 'mr' ? 'active' : ''}>
                      🇮🇳 Marathi
                    </button>
                  </div>
                )}
              </div>
              <button 
                className="chatbot-clear"
                onClick={clearChat}
                aria-label={getUIText(selectedLanguage).clearChat}
                title={getUIText(selectedLanguage).clearChat}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={`${index}-${msg.timestamp}`} className={`message ${msg.sender}`}>
                {msg.sender === 'bot' ? (
                  <div className="message-content">
                    <div className="message-avatar">
                      {/* 3D Model in chat messages */}
                    </div>
                    <div className="message-text">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div className="message-content user">
                    <div className="message-text">
                      {msg.text}
                    </div>
                    <div className="message-avatar user">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="message-content">
                  <div className="message-avatar">
                  </div>
                  <div className="message-text typing">
                    <div className="typing-indicator">
                      <span/>
                      <span/>
                      <span/>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {suggestions.length > 0 && (
            <div className="suggestions-container">
              <div className="suggestions-title">{getUIText(selectedLanguage).tryAsking}</div>
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="chatbot-input">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? getUIText(selectedLanguage).listening : getUIText(selectedLanguage).typePlaceholder}
                aria-label="Type your question"
                disabled={isListening}
              />
              <button 
                type="button"
                className={`voice-button ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                )}
              </button>
            </div>
            <button 
              type="submit" 
              className="send-button" 
              disabled={!input.trim() || isListening}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;