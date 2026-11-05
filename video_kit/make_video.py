#!/usr/bin/env python3
"""
キャラ差し替え版ショート動画を組み立てるスクリプト（ffmpeg が必要）

使い方:
  1) character.json にキャラ名と見た目を書く
  2) python3 make_video.py prompts      -> prompts.txt（画像生成用プロンプト）と script.txt（ナレーション原稿）を出力
  3) 画像を images/01.png ... images/34.png に置く（jpg も可）
  4) ナレーション音声を置く（どちらか）
       - audio/01.mp3 ... audio/34.mp3   … シーンごと（長さは音声に自動で合わせる）
       - narration.mp3                    … 1本にまとめた音声（scenes.csv の sec で尺を決める）
     ※ どちらも無ければ無音で書き出します（尺の確認用）
     任意: bgm.mp3 を置くと小さめの音量で重ねます
  5) python3 make_video.py build        -> output.mp4（576x1024 / 30fps / 字幕焼き込み）
"""
import csv, json, os, subprocess, sys, shutil, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 576, 1024, 30


def load():
    with open(os.path.join(HERE, "character.json"), encoding="utf-8") as f:
        ch = json.load(f)
    with open(os.path.join(HERE, "scenes.csv"), encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    for r in rows:
        for k in ("narration", "caption", "prompt"):
            name = ch.get("name_en", ch["name"]) if k == "prompt" else ch["name"]
            r[k] = r[k].replace("{CHAR_DESC}", ch["description_en"]).replace("{CHAR}", name)
    return ch, rows


def cmd_prompts():
    ch, rows = load()
    with open(os.path.join(HERE, "prompts.txt"), "w", encoding="utf-8") as f:
        for r in rows:
            f.write(f"[{r['id']}] {r['prompt']}, {ch['style_en']}\n\n")
    with open(os.path.join(HERE, "script.txt"), "w", encoding="utf-8") as f:
        for r in rows:
            f.write(f"{r['id']}  {r['narration']}\n")
    print("prompts.txt / script.txt を書き出しました")


def probe_dur(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "default=nw=1:nk=1", path], capture_output=True, text=True).stdout
    return float(out.strip())


def find(base):
    for ext in (".png", ".jpg", ".jpeg", ".webp", ".mp3", ".wav", ".m4a"):
        if os.path.exists(base + ext):
            return base + ext
    return None


def ts(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def run(args):
    subprocess.run(args, check=True)


def cmd_build():
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg が見つかりません。インストールしてください。")
    ch, rows = load()
    tmp = tempfile.mkdtemp()
    per_scene_audio = all(find(os.path.join(HERE, "audio", r["id"])) for r in rows)
    clips, srt, t = [], [], 0.0
    for i, r in enumerate(rows):
        img = find(os.path.join(HERE, "images", r["id"]))
        if per_scene_audio:
            aud = find(os.path.join(HERE, "audio", r["id"]))
            dur = probe_dur(aud) + 0.15
        else:
            aud, dur = None, float(r["sec"])
        n = int(round(dur * FPS))
        clip = os.path.join(tmp, f"{r['id']}.mp4")
        if img:
            # ゆっくりズームイン（Ken Burns）
            vf = (f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
                  f"zoompan=z='1+0.06*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={W}x{H}:fps={FPS}")
            src = ["-loop", "1", "-i", img]
        else:
            print(f"  ! images/{r['id']}.png が無いので仮の画面にします")
            vf = "null"
            src = ["-f", "lavfi", "-i", f"color=c=0x16213e:s={W}x{H}:r={FPS}"]
        aud_in = ["-i", aud] if aud else ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"]
        run(["ffmpeg", "-v", "error", "-y", *src, *aud_in, "-vf", vf + ",format=yuv420p",
             "-af", "apad", "-t", f"{dur:.3f}", "-r", str(FPS), "-c:v", "libx264", "-preset", "veryfast",
             "-c:a", "aac", "-ar", "44100", "-ac", "2", clip])
        clips.append(clip)
        srt.append(f"{i+1}\n{ts(t)} --> {ts(t+dur)}\n{r['caption']}\n")
        t += dur
    lst = os.path.join(tmp, "list.txt")
    with open(lst, "w") as f:
        f.writelines(f"file '{c}'\n" for c in clips)
    srt_path = os.path.join(tmp, "subs.srt")
    with open(srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(srt))
    joined = os.path.join(tmp, "joined.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", joined])

    font = ch.get("font", "Noto Sans CJK JP")
    style = (f"FontName={font},FontSize=16,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,"
             f"BorderStyle=1,Outline=3,Shadow=0,Alignment=2,MarginV=34")
    vf = f"subtitles={srt_path}:force_style='{style}'"
    inputs = ["-i", joined]
    narr = find(os.path.join(HERE, "narration"))
    bgm = find(os.path.join(HERE, "bgm"))
    amix = []
    if narr and not per_scene_audio:
        inputs += ["-i", narr]
        base = "[1:a]"
    else:
        base = "[0:a]"
    if bgm:
        inputs += ["-stream_loop", "-1", "-i", bgm]
        bi = len([x for x in inputs if x == "-i"]) - 1
        amix = ["-filter_complex", f"[{bi}:a]volume=0.12[b];{base}[b]amix=inputs=2:duration=first[a]", "-map", "[a]"]
    else:
        amix = ["-map", base.strip("[]")]
    out = os.path.join(HERE, "output.mp4")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-map", "0:v", *amix, "-vf", vf,
         "-t", f"{t:.3f}", "-c:v", "libx264", "-crf", "20", "-c:a", "aac", "-b:a", "192k", out])
    print(f"完成: {out}  ({t:.1f}秒)")


if __name__ == "__main__":
    {"prompts": cmd_prompts, "build": cmd_build}.get(sys.argv[1] if len(sys.argv) > 1 else "", lambda: print(__doc__))()
