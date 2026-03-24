# 表記ルール・命名規則

## 基本方針
- 正規データの唯一の基準は `data/members/<id>.json`
- PDF は出典であり、画面表示値は必ず JSON に正規化して保持する
- 不明値を推測で埋めない
- ルール変更はまず完成見本 `hr-0001` に反映してから広げる

## 完成見本の基準
- 基準議員: 青山繁晴
- 基準ファイル: `data/members/hr-0001.json`
- 基準状態: `verified`
- 参照 PDF: `data/source-pdf/members.pdf`
- 以後の20名追加は、この見本と同じ粒度、同じ表記、同じ出典記録で作る

## JSON キー
- `id`: `hr-0001` 形式の一意ID
- `name`: 表示用氏名
- `nameKana`: ひらがな
- `party`: 政党正式表記
- `electionType`: `single` または `proportional`
- `district`: 小選挙区名
- `block`: 比例ブロック名
- `prefecture`: 都道府県正式表記
- `wins`: 当選回数の整数
- `birthDate`: `YYYY-MM-DD`。不明時は空文字
- `age`: 数値または `null`
- `career`: 1要素1事項の配列
- `photo`: `/data/photos/<id>.jpg`
- `sourcePdf`: `/data/source-pdf/...` 形式のアプリ基準パス
- `sourcePage`: 出典 PDF の実ページ番号
- `status`: `draft` または `verified`
- `notes`: 補足メモ

## ID とファイル名
- ID 形式は `hr-` + 4桁ゼロ埋め
- JSON ファイル名は `<id>.json`
- 写真ファイル名は `<id>.jpg`
- `id`、JSON 名、写真名、`index.json` の参照を一致させる

## 写真ルール
- 写真パスは `/data/photos/<id>.jpg`
- UI で使う写真は `.jpg` に固定
- 正式写真がない間だけプレースホルダーを許可する
- `verified` にする時は、本人写真と出典確認を終えていること

## 出典ルール
- `sourcePdf` は空文字ではなく、実在する PDF パスを入れる
- `sourcePage` は実ファイル上のページ番号を入れる
- `verified` は `sourcePdf` と `sourcePage` がそろって初めて付ける
- PDF の保存場所は `data/source-pdf/` に固定する

## 選出区分ルール
- `electionType` は `single` または `proportional`
- `single` の場合は `district` 必須、`block` は空文字
- `proportional` の場合は `block` 必須、`district` は空文字
- UI 表示ラベルは以下に固定
  - `single` => `小選挙区`
  - `proportional` => `比例代表`

## 表記ルール
- 氏名は公的資料の表記に合わせる
- `nameKana` はひらがなで統一する
- 政党名は略称ではなく正式表記に統一する
- 都道府県は正式表記に統一する
- 小選挙区は `兵庫8区` のように簡潔な表記へ統一する
- 比例ブロックは `東京` `近畿` など正式ブロック名に統一する

## 欠損値ルール
- 不明な文字列は空文字を許可するのは `birthDate` `sourcePdf` のような未確認入力だけに限定する
- 不明な数値は `null`
- `career` は空でも配列を維持する
- 未確認データは `status: "draft"`
- 出典確認済みで主要項目がそろったものだけ `status: "verified"`

## 経歴ルール
- `career` は必ず配列
- 1要素に1事項だけ入れる
- 長文の段落にしない
- 省略しすぎず、一覧ではなくカード裏面で読みやすい長さに保つ

## バッチ追加ルール
- 新規追加は必ずバッチ単位で行う
- 追加前後で `npm run validate` を実行する
- 20名検証で表記ゆれが出たら、まず完成見本と docs を直してから量産へ進む
