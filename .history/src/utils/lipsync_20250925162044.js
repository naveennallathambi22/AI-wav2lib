// src/utils/lipsync.js
export const generateLipSyncVideo = async (text, lang = 'en') => {
  try {
    // Use localhost for development
    const response = await fetch('http://localhost:5000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data; // { video_url: "/results/xxx.mp4", audio_url: "/results/xxx.wav" }
  } catch (error) {
    console.error("LipSync generation failed:", error);
    return null;
  }
};
