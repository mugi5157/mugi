# script.txt の各行を gTTS で読み上げ audio/NN.mp3 に保存（1.6倍速）
import os, subprocess, sys, tempfile
from gtts import gTTS
here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for line in open(os.path.join(here, "script.txt"), encoding="utf-8"):
    sid, text = line.strip().split(None, 1)
    out = os.path.join(here, "audio", f"{sid}.mp3")
    tmp = tempfile.mktemp(suffix=".mp3")
    gTTS(text, lang="ja").save(tmp)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "atempo=1.6", out], check=True)
    print(sid, end=" ", flush=True)
print("done")
