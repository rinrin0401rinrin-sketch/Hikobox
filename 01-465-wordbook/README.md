# Hikobox

衆議院議員465名を、顔写真つきカードで学べる iPhone 優先の PWA 単語帳アプリです。

既存の `data/` を正規データとして維持しながら、`小選挙区` `比例代表` `検索` `当選1回生` `政党別` `465ランダム` `女性議員のみ` の導線で見やすく確認できる構成にしています。顔写真と氏名の対応を最重要とし、既存データを壊さない前提で UI と運用を整理しています。

ブラウザでは、直前のタブ、選択議員、主な絞り込み条件を `localStorage` に保持し、再訪時の確認を少し楽にしています。

詳しい基準仕様は [`docs/spec-465-pwa.md`](/Users/hasegawaakihiko/Codex/Codex-議員単語帳-POG/01-465-wordbook/docs/spec-465-pwa.md) を参照してください。
最終確認の 1 枚版は [`docs/final-check.md`](/Users/hasegawaakihiko/Codex/Codex-議員単語帳-POG/01-465-wordbook/docs/final-check.md) にまとめています。
仕上げ前の短い確認項目は [`docs/finish-checklist.md`](/Users/hasegawaakihiko/Codex/Codex-議員単語帳-POG/01-465-wordbook/docs/finish-checklist.md) にまとめています。
共有テスト版の最短手順は [`docs/tester-quickstart.md`](/Users/hasegawaakihiko/Codex/Codex-議員単語帳-POG/01-465-wordbook/docs/tester-quickstart.md) に切り出しています。
共有 URL を外に送る前の確認は [`docs/share-url-checklist.md`](/Users/hasegawaakihiko/Codex/Codex-議員単語帳-POG/01-465-wordbook/docs/share-url-checklist.md) に切り出しています。
Mac ログイン時の自動起動は [`docs/mac-login-autostart.md`](/Users/hasegawaakihiko/Codex/Codex-議員単語帳-POG/01-465-wordbook/docs/mac-login-autostart.md) にまとめています。

## 起動方法
- ローカルサーバー起動: `python3 -m http.server 8000`
- Mac常駐向け起動: [`start_app.command`](/Users/hasegawaakihiko/Codex/Codex-議員単語帳-POG/01-465-wordbook/start_app.command)
- build込み起動: [`start_app_with_build.command`](/Users/hasegawaakihiko/Codex/Codex-議員単語帳-POG/01-465-wordbook/start_app_with_build.command)
- ブラウザ表示: `http://127.0.0.1:8000/`
- テスト: `npm test`
- データ整合性チェック: `npm run validate`
- 監査補助: `npm run audit`
- 資産確認: `npm run verify:assets`
- 公開前の通し確認: `npm run verify:release`
- Safari UI スモーク確認: `npm run smoke:ui`

## データの置き場
- 一覧入口: `data/members/index.json`
- 検索用一覧: `data/members/search-index.json`
- 補助台帳: `data/member-groups.json`
- 個票データ: `data/members/hr-XXXX.json`
- 顔写真: `data/photos/hr-XXXX.jpg`
- 一覧用サムネイル: `data/photos/thumbs/hr-XXXX.jpg`
- バッチ台帳: `data/batches/*`
- 参照資料: `members.pdf` と `data/source-pdf/members.pdf`

## データ修正方法
1. 対象の個票 JSON を開く
2. `name` `party` `electionType` `district` `block` `prefecture` などを修正する
3. 必要に応じて `index.json` の該当 summary も同期する
4. `npm run build:search-index` を実行して検索用 index を更新する
5. `npm run validate` を実行する
6. アプリを開いて、対象議員のカード表面と裏面を確認する

### 補助台帳メモ
- `当選1回生` は `search-index.json` の `wins` を使っています
- `女性議員のみ` は `data/member-groups.json` の `womenIds` を使っています
- 元の個票 JSON に女性区分を直接足さず、補助台帳で持つのは、既存データ構造を壊さずに修正しやすくするためです

### 判断メモ
- `districtType` `districtName` `proportionalBlock` `image` などの追加項目は、今は元 JSON に直接書き込まず、`src/member-store.js` で派生項目として生成しています
- 理由は、465件の一括移行を避け、今後も差分レビューしやすくするためです

## 画像差し替え方法
1. `data/photos/hr-XXXX.jpg` を差し替える
2. 対応する `data/members/hr-XXXX.json` の `photo` が同じ ID を指しているか確認する
3. `npm run build:thumbnails` を実行して一覧用サムネイルを更新する
4. アプリ上で該当議員を開き、顔写真と氏名の対応が正しいか目視確認する
5. `npm run validate` を実行する

## iPhone で確認する方法
1. 同じネットワーク上でローカルサーバーを起動する
2. iPhone Safari で `http://<PCのIPアドレス>:8000/` を開く
3. 画面上部の `テスト版` 表示が想定した版になっているか確認する
4. `小選挙区` `比例代表` `検索` を順に確認する
5. `小選挙区` の都道府県が `北海道 / 東北 / 関東 / 中部 / 近畿 / 中国 / 四国 / 九州・沖縄` の地域順で並ぶか確認する
6. カード表面が顔写真だけで、`めくる` 後に氏名や所属情報が見えるか確認する
7. 画像の崩れ、タップしにくさ、スクロール詰まりがないか見る

### 実機がつながらない時の代替確認
1. Mac Safari で `http://127.0.0.1:8000/` を開く
2. `Safari > 設定 > 詳細 > メニューバーに開発メニューを表示` をオンにする
3. `開発 > レスポンシブデザインモードにする` を開く
4. `iPhone 14` か `iPhone 15` 相当幅で確認する
5. 必要なら `npm run smoke:ui` で SafariDriver による最小導線確認を行う

## PWA として追加する方法
### iPhone
1. Safari でアプリを開く
2. 共有メニューを開く
3. `ホーム画面に追加` を選ぶ

### その他ブラウザ
- インストールバナーまたはブラウザのインストール導線を利用する

## 保守向けチェック
- `npm run validate`: ID、必須項目、写真参照、区分整合性の確認
- `npm run audit`: 重複名、重複写真参照、index と個票の食い違い確認
- `npm run build:search-index`: `nameKana` を含む検索用 index を更新
- `npm run build:thumbnails`: 一覧用サムネイルを `data/photos/thumbs/` に再生成する
- `npm run verify:assets`: 写真、サムネイル、検索 index の取りこぼしを確認する
- `npm run verify:release`: validate、audit、asset verify、test を順に実行し、可能なら smoke UI まで自動確認する
- `npm run smoke:ui`: SafariDriver で 7 タブ、ひらがな検索、0件表示、カード裏面、狭幅の最低限を確認
- `npm run smoke:ui` は検索0件表示と再読込後の状態復元も確認する
- 個別確認: `data/members/hr-XXXX.json` と `data/photos/hr-XXXX.jpg` を対で見る
- オフライン確認: いったん読み込んだ後に通信を切り、退避画面または保存済み表示が成立するかを見る

## 今後の改善候補
- 選択状態の永続化
- オフラインキャッシュ範囲の段階的拡張
- 画像サムネイル最適化
- 更新日時や差分履歴の一覧表示
- 監査結果の JSON 出力や簡易 HTML レポート化
- 共有 URL の固定運用
