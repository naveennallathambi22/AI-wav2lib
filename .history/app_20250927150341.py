# At the top (imports)
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
from TTS.api import TTS
import subprocess
import threading
import time

# Initialize Flask
app = Flask(__name__, static_folder='static')
CORS(app)

# Paths
WAV2LIP_DIR = "backend/Wav2Lip"
AVATAR_PATH = "public/avatars/Base.png"
OUTPUT_DIR = "static/results"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load ONLY English Indian TTS model
print("⏳ Loading TTS model...")
TTS_MODEL = TTS(model_name="tts_models/en/ek1/tacotron2", progress_bar=False, gpu=True)
print("✅ TTS model loaded.")

# Cleanup function
def delete_after_delay(filepath, delay=3600):
    time.sleep(delay)
    try:
        os.remove(filepath)
        os.remove(filepath.replace('.mp4', '.wav'))
    except:
        pass

# API endpoint
@app.route('/generate', methods=['POST'])
def generate_video():
    data = request.json
    text = data.get('text', 'Hello')
    lang = data.get('lang', 'en')  # We keep lang for future use, but use same TTS

    uid = str(uuid.uuid4())
    audio_path = f"{OUTPUT_DIR}/{uid}.wav"
    video_path = f"{OUTPUT_DIR}/{uid}.mp4"
    
# Generate speech using English Indian voice for ALL languages
TTS_MODEL.tts_to_file(text=text, file_path=audio_path)

    # Run Wav2Lip
    cmd = [
        "python", "inference.py",
        "--checkpoint_path", "checkpoints/wav2lip_gan.pth",
        "--face", AVATAR_PATH,
        "--audio", audio_path,
        "--outfile", video_path,
        "--resize_factor", "1"
    ]

    result = subprocess.run(cmd, cwd=WAV2LIP_DIR, capture_output=True, text=True)

    if result.returncode != 0:
        return jsonify({"error": "Wav2Lip failed", "stderr": result.stderr}), 500

    # Start cleanup
    threading.Thread(target=delete_after_delay, args=(video_path,)).start()

    return jsonify({
        "video_url": f"/results/{uid}.mp4",
        "audio_url": f"/results/{uid}.wav"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)