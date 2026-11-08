#!/usr/bin/env python3
"""「むぎの夜間記録」を組み立てる: python3 build.py [tts]
 tts を付けると audio/NN.mp3 を gTTS で作り直す（声を低くして 1.45 倍速）"""
import csv, os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); W, H, FPS = 576, 1024, 30
rows = list(csv.DictReader(open(os.path.join(HERE, "scenes.csv"), encoding="utf-8")))
run = lambda a: subprocess.run(a, check=True)
dur = lambda p: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
tmp = tempfile.mkdtemp()

if "tts" in sys.argv:
    from gtts import gTTS
    for r in rows:
        raw = os.path.join(tmp, r["id"] + ".mp3"); gTTS(r["narration"], lang="ja").save(raw)
        # 24kHz を 0.82 倍で再生 → 声が低くなる。atempo で速さを補正
        run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "asetrate=24000*0.82,aresample=44100,atempo=1.45/0.82,atempo=1.0", os.path.join(HERE, "audio", r["id"] + ".mp3")])

GLITCH = {"02", "07", "11", "15"}   # 色ズレを入れるシーン
clips, srt, t = [], [], 0.0
for i, r in enumerate(rows):
    aud = os.path.join(HERE, "audio", r["id"] + ".mp3"); d = dur(aud) + 0.25; n = int(d * FPS)
    k = i % 4   # カメラワーク：ズームイン → 右へパン → ズームアウト → 上へパン
    z, x, y = [("1+0.12*on/%d" % n, "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"),
               ("1.15", "(iw-iw/zoom)*on/%d" % n, "ih/2-(ih/zoom/2)"),
               ("1.14-0.12*on/%d" % n, "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"),
               ("1.15", "iw/2-(iw/zoom/2)", "(ih-ih/zoom)*(1-on/%d)" % n)][k]
    vf = (f"scale={W*2}:{H*2},zoompan=z='{z}':x='{x}':y='{y}':d={n}:s={W}x{H}:fps={FPS},"
          "noise=alls=7:allf=t,eq=brightness='0.03*sin(t*37)':eval=frame")  # 粒状ノイズ＋ちらつき
    if r["id"] in GLITCH: vf += ",rgbashift=rh=-6:bh=6"
    if r["flash"]: vf += ",fade=in:st=0:d=0.35:color=white"   # 白フラッシュで場面転換
    vf += ",fade=in:st=0:d=0.12,format=yuv420p"
    c = os.path.join(tmp, f"c{i:02}.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-i", os.path.join(HERE, "images", r["id"] + ".png"), "-i", aud,
         "-vf", vf, "-af", "apad", "-t", f"{d:.3f}", "-r", str(FPS), "-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac", "-ar", "44100", "-ac", "2", c])
    clips.append(c)
    f = lambda x: "%02d:%02d:%02d,%03d" % (x // 3600, x // 60 % 60, int(x) % 60, int(x * 1000) % 1000)
    srt.append(f"{i+1}\n{f(t)} --> {f(t+d)}\n{r['caption']}\n"); 
    if r["id"] == "07": boom_at = t   # 停電の「バツン」音
    t += d
open(os.path.join(tmp, "l.txt"), "w").writelines(f"file '{c}'\n" for c in clips)
open(os.path.join(tmp, "s.srt"), "w", encoding="utf-8").write("\n".join(srt))
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", os.path.join(tmp, "l.txt"), "-c", "copy", os.path.join(tmp, "j.mp4")])

# 環境音：低いドローン＋機械のハム、爆発音
drone = os.path.join(tmp, "drone.wav")
run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"sine=f=55:d={t}", "-f", "lavfi", "-i", f"sine=f=82.4:d={t}", "-f", "lavfi", "-i", f"anoisesrc=c=brown:a=0.3:d={t}",
     "-filter_complex", "[0]volume=0.5[a];[1]volume=0.25,tremolo=f=0.2:d=0.6[b];[2]lowpass=f=300,volume=0.6[c];[a][b][c]amix=inputs=3,volume=0.5", "-ar", "44100", "-ac", "2", drone])
boom = os.path.join(tmp, "boom.wav")
run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anoisesrc=c=brown:a=1:d=1.2", "-af", "lowpass=f=220,volume=4,afade=t=out:st=0.05:d=1.1,adelay=%d|%d" % (boom_at * 1000, boom_at * 1000), "-ar", "44100", "-ac", "2", boom])

style = "FontName=WenQuanYi Zen Hei,FontSize=17,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=3,Shadow=0,Alignment=2,MarginV=100"
out = os.path.join(HERE, "output.mp4")
run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(tmp, "j.mp4"), "-i", drone, "-i", boom,
     "-filter_complex", "[0:a]volume=1.6[n];[1:a]volume=0.35[d];[2:a]volume=0.8[b];[n][d][b]amix=inputs=3:duration=first:normalize=0[a]",
     "-map", "0:v", "-map", "[a]", "-vf", f"subtitles={os.path.join(tmp, 's.srt')}:force_style='{style}'",
     "-c:v", "libx264", "-crf", "27", "-preset", "slow", "-c:a", "aac", "-b:a", "192k", out])
print(f"完成: {out} ({t:.1f}秒)")
