# Hikobox

衆議院議員465名を、顔写真つきカードで学べる iPhone 優先の PWA 単語帳アプリです。

既存の `data/` を正規データとして維持しながら、`小選挙区` `比例代表` `検索` の3導線で見やすく確認できる構成にしています。顔写真と氏名の対応を最重要とし、既存データを壊さない前提で UI と運用を整理しています。

ブラウザでは、直前のタブ、選択議員、主な絞り込み条件を `localStorage` に保持し、再訪時の確認を少し楽にしています。

詳しい基準仕様は [`docs/spec-465-pwa.md`](/Users/hasegawaakihiko/Codex/New%20project/docs/spec-465-pwa.md) を参照してください。
仕上げ前の短い確認項目は [`docs/finish-checklist.md`](/Users/hasegawaakihiko/Codex/New%20project/docs/finish-checklist.md) にまとめています。

## 起動方法
- ローカルサーバー起動: `python3 -m http.server 8000`
- ブラウザ表示: `http://127.0.0.1:8000/`
- テスト: `npm test`
- データ整合性チェック: `npm run validate`
- 監査補助: `npm run audit`
- Safari UI スモーク確認: `npm run smoke:ui`

## データの置き場
- 一覧入口: `data/members/index.json`
- 検索用一覧: `data/members/search-index.json`
- 個票データ: `data/members/hr-XXXX.json`
- 顔写真: `data/photos/hr-XXXX.jpg`
- バッチ台帳: `data/batches/*`
- 参照資料: `members.pdf` と `data/source-pdf/members.pdf`

## データ修正方法
1. 対象の個票 JSON を開く
2. `name` `party` `electionType` `district` `block` `prefecture` などを修正する
3. 必要に応じて `index.json` の該当 summary も同期する
4. `npm run build:search-index` を実行して検索用 index を更新する
5. `npm run validate` を実行する
6. アプリを開いて、対象議員のカード表面と裏面を確認する

### 判断メモ
- `districtType` `districtName` `proportionalBlock` `image` などの追加項目は、今は元 JSON に直接書き込まず、`src/member-store.js` で派生項目として生成しています
- 理由は、465件の一括移行を避け、今後も差分レビューしやすくするためです

## 画像差し替え方法
1. `data/photos/hr-XXXX.jpg` を差し替える
2. 対応する `data/members/hr-XXXX.json` の `photo` が同じ ID を指しているか確認する
3. アプリ上で該当議員を開き、顔写真と氏名の対応が正しいか目視確認する
4. `npm run validate` を実行する

## iPhone で確認する方法
1. 同じネットワーク上でローカルサーバーを起動する
2. iPhone Safari で `http://<PCのIPアドレス>:8000/` を開く
3. `小選挙区` `比例代表` `検索` を順に確認する
4. カードの表裏切り替え、前へ / 次へ、検索0件表示を確認する
5. 画像の崩れ、タップしにくさ、スクロール詰まりがないか見る

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
- `npm run smoke:ui`: SafariDriver で 3 タブ、ひらがな検索、0件表示、カード裏面、狭幅の最低限を確認
- `npm run smoke:ui` は検索0件表示と再読込後の状態復元も確認する
- 個別確認: `data/members/hr-XXXX.json` と `data/photos/hr-XXXX.jpg` を対で見る
- オフライン確認: いったん読み込んだ後に通信を切り、退避画面または保存済み表示が成立するかを見る

## 今後の改善候補
- 選択状態の永続化
- オフラインキャッシュ範囲の段階的拡張
- 画像サムネイル最適化
- 更新日時や差分履歴の一覧表示
- 監査結果の JSON 出力や簡易 HTML レポート化
