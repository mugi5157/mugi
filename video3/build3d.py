#!/usr/bin/env python3
"""3D 版の書き出し: node render3d/render.js でフレームを作ってから python3 build3d.py"""
import csv, json, os, subprocess, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(HERE, "render3d")
tl = json.load(open(os.path.join(R, "timeline.json"), encoding="utf-8"))
caps = {r["id"]: r["caption"] for r in csv.DictReader(open(os.path.join(HERE, "scenes.csv"), encoding="utf-8"))}
total = tl[-1]["start"] + tl[-1]["dur"]; tmp = tempfile.mkdtemp()
run = lambda a: subprocess.run(a, check=True)

# ナレーション：各シーンの頭に配置して1本に
narr = os.path.join(tmp, "narr.wav"); ins, fl = [], []
for i, s in enumerate(tl):
    ins += ["-i", os.path.join(HERE, "audio", s["id"] + ".mp3")]
    ms = int(s["start"] * 1000); fl.append(f"[{i}:a]adelay={ms}|{ms},aformat=channel_layouts=stereo[a{i}]")
run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", ";".join(fl) + ";" + "".join(f"[a{i}]" for i in range(len(tl))) + f"amix=inputs={len(tl)}:normalize=0,apad,atrim=0:{total}[o]", "-map", "[o]", "-ar", "44100", narr])
# 環境音（低いドローン＋ハム）と停電の「バツン」
boom = int(next(s["start"] for s in tl if s["id"] == "07") * 1000 + 350)
amb = os.path.join(tmp, "amb.wav")
run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"sine=f=55:d={total}", "-f", "lavfi", "-i", f"sine=f=82.4:d={total}", "-f", "lavfi", "-i", f"anoisesrc=c=brown:a=0.3:d={total}",
     "-f", "lavfi", "-i", "anoisesrc=c=brown:a=1:d=1.2",
     "-filter_complex", f"[0]volume=0.5[a];[1]volume=0.25,tremolo=f=0.2:d=0.6[b];[2]lowpass=f=300,volume=0.6[c];[3]lowpass=f=220,volume=5,afade=t=out:st=0.05:d=1.1,adelay={boom}|{boom}[d];[a][b][c]amix=inputs=3,volume=0.18[bg];[bg][d]amix=inputs=2:duration=first:normalize=0",
     "-ar", "44100", "-ac", "2", amb])
# 字幕
f = lambda x: "%02d:%02d:%02d,%03d" % (x // 3600, x // 60 % 60, int(x) % 60, int(x * 1000) % 1000)
srt = os.path.join(tmp, "s.srt")
open(srt, "w", encoding="utf-8").write("\n".join(f"{i+1}\n{f(s['start'])} --> {f(s['start']+s['dur'])}\n{caps[s['id']]}\n" for i, s in enumerate(tl)))
style = "FontName=WenQuanYi Zen Hei,FontSize=17,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=3,Shadow=0,Alignment=2,MarginV=100"
# 色ズレを入れる区間
gl = "+".join(f"between(t,{s['start']:.2f},{s['start']+min(.5, s['dur']):.2f})" for s in tl if s["flash"] or s["id"] in ("07", "15"))
vf = f"noise=alls=8:allf=t,rgbashift=rh=-7:bh=7:enable='{gl}',subtitles={srt}:force_style='{style}',format=yuv420p"
out = os.path.join(HERE, "output.mp4")
run(["ffmpeg", "-v", "error", "-y", "-framerate", "30", "-i", os.path.join(R, "frames", "%06d.png"), "-i", narr, "-i", amb,
     "-filter_complex", "[1:a]volume=1.6[n];[2:a]volume=1.0[b];[n][b]amix=inputs=2:duration=first:normalize=0[a]", "-map", "0:v", "-map", "[a]",
     "-vf", vf, "-t", f"{total:.3f}", "-c:v", "libx264", "-crf", "24", "-preset", "slow", "-c:a", "aac", "-b:a", "192k", out])
print(f"完成: {out} ({total:.1f}秒)")
