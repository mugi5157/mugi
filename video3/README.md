# むぎの夜間記録（オリジナルの犬キャラのショート動画）

監視ルームのモニターに夜の動物病院の記録が映る演出の、約64秒の縦型動画です。
キャラクター（柴犬のむぎ）も話も、このリポジトリ用のオリジナルです。

- `scenes.csv` … ナレーション・字幕・録画時刻・白フラッシュの有無（17シーン）
- `render/scenes.js` … 絵（むぎ・子犬・病院・監視ルームは HTML/CSS 3D で斜めのモニター）
- `node render/render.js` … `images/NN.png` を書き出す（Playwright が必要）
- `python3 build.py tts` … gTTS で声を作り直して書き出す（`tts` なしなら今の `audio/` を使う）
- 出力: `output.mp4`（ズーム・パンのカメラワーク、白フラッシュ、色ズレ、ノイズ、ちらつき、ドローン音、停電音）

## 3D 版（現在の output.mp4）

three.js で監視ルームとむぎを 3D で作り、カメラワークとキャラの動き（歩く・座る・しっぽを振る・呼吸）を付けています。

1. `cd render3d && npm install`（three.js）
2. `node render3d/render.js` … `render3d/frames/` に 30fps のフレームを書き出す（約5分）
3. `python3 build3d.py` … 声・環境音・字幕・ノイズを重ねて `output.mp4` を書き出す
