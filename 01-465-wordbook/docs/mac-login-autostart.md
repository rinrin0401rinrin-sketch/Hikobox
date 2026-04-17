# Macログイン時の自動起動

## 推奨構成
- ログイン項目には [`start_app.command`](/Users/hasegawaakihiko/Codex/Codex-議員単語帳-POG/01-465-wordbook/start_app.command) を追加する
- これは `localhost:8000` のローカルサーバーだけを起動する軽い版
- `search-index` やサムネイルを更新したい時だけ [`start_app_with_build.command`](/Users/hasegawaakihiko/Codex/Codex-議員単語帳-POG/01-465-wordbook/start_app_with_build.command) を手動で使う

## 使い分け
- 普段の常駐: `start_app.command`
- データ更新後の起動: `start_app_with_build.command`

## ログイン項目への追加
1. `システム設定`
2. `一般`
3. `ログイン項目と機能拡張`
4. `ログイン時に開く項目` の `+`
5. このプロジェクトの [`start_app.command`](/Users/hasegawaakihiko/Codex/Codex-議員単語帳-POG/01-465-wordbook/start_app.command) を選ぶ

## 起動後の確認
- ブラウザで [http://127.0.0.1:8000/](http://127.0.0.1:8000/) を開く
- iPhone は同一 Wi-Fi 上で `http://MacのIPアドレス:8000/` を開く

## ログとPID
- ログ: `~/Library/Logs/Hikobox/http-server-8000.log`
- PID: `~/Library/Application Support/Hikobox/http-server-8000.pid`

## 補足
- 8000番ポートがすでに使われている時は、既存の待受をそのまま使う
- Terminal から手動起動しても同じ挙動になる
