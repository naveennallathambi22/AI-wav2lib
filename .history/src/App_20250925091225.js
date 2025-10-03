import React, { useEffect, useRef, useState } from 'react';
import { generateLipSyncVideo } from './utils/lipsync';
import './App.css';
import Chatbot from './components/Chatbot';

function App() {
  // Outfit mapping for avatar switching
  const getOutfitVideo = (queryText, currentLanguage) => {
    const text = queryText.toLowerCase();
    // Festival keywords
    if (text.includes('diwali') || text.includes('दिवाली') || text.includes('दीपावली')) {
      return '/avatars/Diwali.png';
    }
    if (text.includes('holi') || text.includes('होली')) {
      return '/avatars/Holi.png';
    }
    if (text.includes('christmas') || text.includes('क्रिसमस')) {
      return '/avatars/Christmas.png';
    }
    // Default to base avatar
    return '/avatars/Base.png';
  };
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showFrame, setShowFrame] = useState(true);
  const [shouldGreet, setShouldGreet] = useState(false);
  const [isFromChatReset, setIsFromChatReset] = useState(false);
  const [isFromLanguageChange, setIsFromLanguageChange] = useState(false);
  const [greetingCompleted, setGreetingCompleted] = useState(false);
  const [addBotMessageFunc, setAddBotMessageFunc] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentVideo, setCurrentVideo] = useState('/eng1.mp4');
  const idleRef = useRef(null);
  const talkingRef = useRef(null);

  // Ensure both videos play continuously (muted) to avoid first-frame blink
  useEffect(() => {
    const idle = idleRef.current;
    const talk = talkingRef.current;
    if (!idle || !talk) return;
    
    try { idle.play().catch(() => {}); } catch (e) {}
    
    if (isSpeaking) {
      // Only restart talking video if it's not already playing
      if (talk.paused || talk.ended) {
        try { 
          talk.currentTime = 0; 
          talk.play().catch(() => {}); 
        } catch (e) {}
      }
    } else {
      // Pause talking video and reset
      try { 
        talk.pause(); 
        talk.currentTime = 0; 
      } catch (e) {}
    }
  }, [isSpeaking]);

  // Multi-language greeting messages
  const getGreetingText = (language, isReset = false, isLanguageChange = false) => {
    const greetings = {
      en: {
        initial: "Hello, how can I help you today?",
        reset: "Hello again! How can I help you today?",
        languageChange: "Hi! I'm now speaking in English. How can I help you?"
      },
      hi: {
        initial: "नमस्ते, आज मैं आपकी कैसे सहायता कर सकता हूं?",
        reset: "नमस्ते फिर से! आज मैं आपकी कैसे सहायता कर सकता हूं?",
        languageChange: "नमस्ते! अब मैं हिंदी में बोल रहा हूं। मैं आपकी कैसे सहायता कर सकता हूं?"
      },
      mr: {
        initial: "नमस्कार, आज मी तुमची कशी मदत करू शकतो?",
        reset: "नमस्कार पुन्हा! आज मी तुमची कशी मदत करू शकतो?",
        languageChange: "नमस्कार! आता मी मराठीत बोलत आहे। मी तुमची कशी मदत करू शकतो?"
      }
    };

    const languageGreetings = greetings[language] || greetings.en;
    if (isLanguageChange) return languageGreetings.languageChange;
    return isReset ? languageGreetings.reset : languageGreetings.initial;
  };

  // Get appropriate voice language code
  const getVoiceLanguage = (language) => {
    switch (language) {
      case 'hi': return 'hi-IN';
      case 'mr': return 'mr-IN';
      default: return 'en-IN';
    }
  };

  // Single greeting logic - handles all greeting scenarios
  useEffect(() => {
    if (!shouldGreet || greetingCompleted) return;

    const performGreeting = async () => {
      // Only trigger on chat reset or language change
      if (!isFromChatReset && !isFromLanguageChange) return;

      setGreetingCompleted(true);
      const greetingText = getGreetingText(currentLanguage, isFromChatReset, isFromLanguageChange);

      setIsTyping(true);
      const media = await generateLipSyncVideo(greetingText, currentLanguage);
      setIsTyping(false);

      if (media) {
        setCurrentVideo(media.video_url);
        setIsSpeaking(true);

        if (addBotMessageFunc) {
          addBotMessageFunc(greetingText);
        }

        const audio = new Audio(media.audio_url);
        audio.play();

        audio.onended = () => {
          setIsSpeaking(false);
          setShouldGreet(false);
          setIsFromChatReset(false);
          setIsFromLanguageChange(false);
        };
      }
    };

    performGreeting();
  }, [shouldGreet, isFromChatReset, isFromLanguageChange, greetingCompleted, currentLanguage, addBotMessageFunc]);

  // Trigger greeting when language changes
  useEffect(() => {
    // Skip if this is the initial load (currentLanguage starts as 'en')
    if (currentLanguage === 'en' && !greetingCompleted) return;
    
    // Skip if we haven't completed initial greeting yet
    if (!greetingCompleted) return;

    // Trigger new greeting when language changes
    console.log('Language changed to:', currentLanguage, '- triggering new greeting');
    setIsFromChatReset(false); // This is a language change, not a chat reset
    setIsFromLanguageChange(true); // Mark as language change greeting
    setShouldGreet(true);
    setGreetingCompleted(false);
  }, [currentLanguage]);

  // Handle user interaction (kept for potential future use)
  const handleUserInteraction = () => {
    // No longer tracking interactions since we always greet
  };

  // Handle chat reset/clear
  const handleChatReset = () => {
    console.log('Chat reset triggered');
    setIsFromChatReset(true);
    setShouldGreet(true);
    setGreetingCompleted(false); // Reset completion flag for new greeting
  };

  // Capture the addBotMessage function from Chatbot
  const handleAddBotMessage = (addBotMessageFunction) => {
    setAddBotMessageFunc(() => addBotMessageFunction);
  };

  // Handle language changes from Chatbot
  const handleLanguageChange = (language) => {
    console.log('Language changed to:', language);
    setCurrentLanguage(language);
  };

  const handleVideoChange = (videoFile) => {
    if (videoFile) {
      setCurrentVideo(videoFile);
    }
  };

  return (
    <div className="chatbot-only">
      {/* Background campus video */}
      <div className="bg-video" aria-hidden="true">
        <video
          className="bg-video-el"
          src="/CAMPUS%20short%20video%202.mp4"
          muted
          loop
          autoPlay
          playsInline
        />
      </div>

      {showFrame && (
        <>
          <div className="frame">
            <div className="pane pane-left">
              <div className="avatar-stage">
                {/* Idle avatar video (shown when not speaking) */}
                <video
                  ref={idleRef}
                  className={`avatar-video idle ${!isSpeaking ? 'visible' : ''}`}
                  src="/avatar_idle.mp4"
                  preload="auto"
                  muted
                  playsInline
                  loop
                  autoPlay
                />

                {/* Talking avatar video (shown while TTS is speaking) */}
                <video
                  ref={talkingRef}
                  className={`avatar-video talking ${isSpeaking ? 'visible' : ''}`}
                  src={currentVideo}
                  preload="auto"
                  muted
                  playsInline
                />
              </div>
            </div>
            <div className="divider" />
            <div className="pane pane-right">
              <Chatbot 
                embedded={true} 
                onSpeakingChange={setIsSpeaking}
                onUserInteraction={handleUserInteraction}
                onChatReset={handleChatReset}
                onAddBotMessage={handleAddBotMessage}
                onLanguageChange={handleLanguageChange}
                onVideoChange={handleVideoChange}
              />
            </div>
          </div>
          <button
            className="frame-close-btn"
            type="button"
            aria-label="Close"
            onClick={() => setShowFrame(false)}
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}

export default App;