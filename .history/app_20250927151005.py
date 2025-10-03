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