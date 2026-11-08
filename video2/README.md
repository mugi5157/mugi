# ランタの記録（オリジナルキャラのショート動画）

暗い監視ルームのモニターに、1995年の監視映像が映る演出の約70秒の縦型動画です。
キャラクター「ランタ」と話は、どちらもこのリポジトリ用のオリジナルです。

- `scenes.csv` … ナレーション・字幕・録画時刻（18シーン）
- `render/scenes.js` … SVG の絵（ランタ、監視ルーム、全画面シーン）
- `node render/render.js` … `images/NN.png` を書き出す（Playwright が必要）
- `python3 build.py tts` … gTTS で声を作り直して書き出す（`tts` を付けなければ今の `audio/` を使う）
- 出力: `output.mp4`（ノイズ・ちらつき・色ズレ・ズーム、低いドローン音、爆発音入り）

声や絵を差し替えるときは、`audio/NN.mp3` や `images/NN.png` を同じ番号で上書きして `python3 build.py` を実行します。
