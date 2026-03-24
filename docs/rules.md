# データルール固定版

## 1. データ設計の基本方針
- 正規データの唯一の基準は `data/members/<id>.json` とする
- PDF は出典であり、画面表示用の値は必ず JSON に正規化して保持する
- 不明値・欠損値・未確認値を推測で埋めない
- 空文字は使わない。文字列項目は内容がある時だけ文字列を入れ、ない時は `null` を使う
- 数値は数値型で保持する。ID、日付、コード、パスは文字列で保持する
- 1つの項目に複数値が入りうるものは配列にする
- 検索・絞り込みで使う主要項目は `label` と `code` を分ける
- 元データから表記を整形した場合は、必要な範囲で `source.raw` に原文を残す
- 20名完成見本では手作業で厳格にそろえ、50名量産では同じルールだけを適用する

## 2. 1議員あたりの標準キー一覧

| キー名 | 必須/任意 | 型 | 内容 | 例 | 注意点 |
| --- | --- | --- | --- | --- | --- |
| `id` | 必須 | `string` | 議員データの一意ID | `hr-0001` | JSON名・画像名・index参照と必ず一致 |
| `name.display` | 必須 | `string` | 表示用の氏名 | `岸田 文雄` | PDF表記を基準にするが、前後空白は除去 |
| `name.kana` | 必須 | `string \| null` | 氏名のよみがな | `きしだ ふみお` | 不明時は `null`、空文字禁止 |
| `name.family` | 任意 | `string \| null` | 姓 | `岸田` | 分割に迷いがある時は `null` |
| `name.given` | 任意 | `string \| null` | 名 | `文雄` | 分割根拠が弱い場合は無理に入れない |
| `name.familyKana` | 任意 | `string \| null` | 姓のかな | `きしだ` | `family` が `null` なら `null` |
| `name.givenKana` | 任意 | `string \| null` | 名のかな | `ふみお` | `given` が `null` なら `null` |
| `photo.path` | 必須 | `string` | 表示に使う画像パス | `/data/photos/hr-0001.jpg` | 常に存在するパスを入れる |
| `photo.exists` | 必須 | `boolean` | 実ファイルが存在するか | `true` | 量産前の検証対象 |
| `photo.isPlaceholder` | 必須 | `boolean` | 代替画像かどうか | `false` | `true` なら `verification.status` は `verified` にしない |
| `photo.originalSource` | 任意 | `string \| null` | 元画像の出典メモ | `衆議院議員名鑑PDF` | 任意だが追跡に有効 |
| `party.code` | 必須 | `string` | 政党の内部値 | `ldp` | 制御語彙から選ぶ |
| `party.label` | 必須 | `string` | 政党の正式表記 | `自由民主党` | 表示の正規値 |
| `party.shortLabel` | 必須 | `string` | 政党の短縮表記 | `自民` | 一覧やカード用 |
| `parliamentaryGroup.code` | 必須 | `string` | 会派の内部値 | `jiyuminshuto_musyokuzoku_no_kai` | 政党と別管理 |
| `parliamentaryGroup.label` | 必須 | `string` | 会派の正式表記 | `自由民主党・無所属の会` | PDFの公式表記に寄せる |
| `parliamentaryGroup.shortLabel` | 必須 | `string` | 会派の短縮表記 | `自民` | UI短縮用。なければ正式表記と同値可 |
| `election.electedVia` | 必須 | `string` | 実際の当選区分 | `single` | `single` / `proportional` のみ |
| `election.candidacyType` | 必須 | `string` | 立候補形態 | `dual` | `single_only` / `proportional_only` / `dual` |
| `election.districtName` | 任意 | `string \| null` | 小選挙区名 | `広島1区` | `candidacyType` が `proportional_only` なら `null` |
| `election.proportionalBlock` | 任意 | `string \| null` | 比例ブロック名 | `中国` | `single_only` なら `null` |
| `election.prefectureCode` | 任意 | `string \| null` | 主都道府県コード | `34` | JIS X 0401 2桁、特定できる時のみ |
| `election.prefectureLabel` | 任意 | `string \| null` | 主都道府県名 | `広島県` | 比例単独で特定不能なら `null` |
| `termsWon` | 必須 | `number \| null` | 当選回数 | `10` | 不明時は `null`、文字列禁止 |
| `birthDate` | 任意 | `string \| null` | 生年月日 | `1957-07-29` | ISO `YYYY-MM-DD` 固定 |
| `age` | 任意 | `number \| null` | 年齢 | `68` | 必ず `ageAsOf` とセット |
| `ageAsOf` | 任意 | `string \| null` | 年齢の基準日 | `2026-03-23` | `age` が `null` なら `null` |
| `careers` | 必須 | `string[]` | 主な経歴 | `["元外務大臣", "元内閣総理大臣"]` | 1要素1事項、改行禁止 |
| `titles` | 必須 | `string[]` | 肩書き | `["衆議院議員"]` | 表示用の短い肩書き |
| `roles` | 必須 | `string[]` | 現在の役職 | `["自由民主党総裁"]` | 複数可、なければ空配列 |
| `source.pdfPath` | 必須 | `string` | 出典PDFパス | `/data/sources/members.pdf` | 相対パスではなくアプリ基準パス |
| `source.pages` | 必須 | `number[]` | 参照ページ | `[12]` | 複数ページ参照に対応 |
| `source.accessedOn` | 必須 | `string` | PDF確認日 | `2026-03-23` | 抽出日ではなく確認日 |
| `source.raw` | 任意 | `object \| null` | 原文保持用 | `{ "party": "自由民主党" }` | 正規化で意味が変わる項目だけ保持 |
| `notes` | 必須 | `string[]` | 備考 | `["年齢はPDF記載値を採用"]` | 補足専用。推測本文を書かない |
| `updatedAt` | 必須 | `string` | 更新日 | `2026-03-23` | JSON編集日、ISO日付 |
| `verification.status` | 必須 | `string` | データ確認ステータス | `reviewed` | `draft` / `reviewed` / `verified` / `needs_fix` |
| `verification.uncertainFields` | 必須 | `string[]` | 不確実な項目一覧 | `["name.family", "birthDate"]` | JSONパス風に記録 |
| `verification.comment` | 任意 | `string \| null` | 確認メモ | `姓と名の分割に確証なし` | `uncertainFields` があれば推奨 |

## 3. 表記ルール一覧
- 文字列の前後空白は削除する
- 空文字は使わない。内容がなければ `null`、複数値がなければ `[]`
- 日本語表示項目は原則として全角日本語を使う
- 内部コード、ID、日付、ファイルパス、列挙値は半角ASCIIを使う
- 氏名の表示は PDF の並びを優先し、機械都合で勝手に改名しない
- 氏名かなはひらがなで統一し、姓と名の間は半角スペース1個とする
- 氏名表示の姓と名の間は半角スペース1個に統一する
- 政党名の正式表記はマスタに固定し、省略しない
- 政党の一覧表示は `party.shortLabel` を使い、元表記の短縮をその場で作らない
- 会派名も `label` と `shortLabel` を固定し、政党名で代用しない
- 都道府県は正式表記で統一する
- 都道府県の内部値は JIS X 0401 の2桁コードを使う
- 小選挙区名は `東京1区` 形式に統一し、`東京都第1区` など別形式を混在させない
- 比例ブロックは `北関東` `東京` `南関東` などの正式ブロック名に固定する
- 記号は日本語表示項目では `・` `（ ）` `、` を使う
- スラッシュ区切りは使わない。複数値は配列に分ける
- 改行は文字列項目に入れない。複数行情報は配列化する
- `notes` も1要素1メモにし、1文字列に複数改行を入れない
- `source.raw` は PDF の原文をそのまま保存し、正規値と混在させない

## 4. 欠損値・不明値ルール
- 不明は `null`
- 該当なしは `null`
- 複数値が存在しない場合は `[]`
- 空文字は禁止
- `0` は実際に0であると確認できた場合だけ使う
- `termsWon` は不明なら `null`、初当選が確認できた時だけ `1`
- `age` は不明なら `null`、計算値を入れる場合は `ageAsOf` 必須
- `photo.exists` は画像ファイルの存在有無、`photo.isPlaceholder` は本人写真かどうかを分ける
- 不確実な情報は値を入れてもよいが、必ず `verification.uncertainFields` に該当キーを入れる
- `verification.status` の意味は固定する
- `draft`: 必須項目未充足、または未確認値が残る
- `reviewed`: 必須項目は埋まり、PDF照合済みだが相互確認未完了
- `verified`: PDF照合済み、表記ルール適合、プレースホルダーなし、不確実項目なし
- `needs_fix`: 既知の矛盾やルール違反がある

## 5. 命名規則

### JSON
- 1議員1ファイル
- 形式は `data/members/hr-0001.json`
- ファイル名は `id + ".json"` のみ
- 大文字禁止

### 画像
- 形式は `data/photos/hr-0001.jpg`
- アプリが参照する顔写真は `.jpg` 固定
- 元画像がなくても同名ファイルを置き、`photo.isPlaceholder = true` にする
- 共有プレースホルダーを直接参照しない。各議員IDの画像として配置する

### フォルダ
- 議員詳細は `data/members/`
- 顔写真は `data/photos/`
- 出典PDFは `data/sources/`
- バッチ管理は `data/batches/<batch-id>/`
- マスタ値は将来的に `data/masters/` へ分離する

### ID
- 形式は `hr-0001`
- 接頭辞 `hr-` は衆議院議員固定
- 4桁ゼロ埋め連番
- IDは意味を持たせない。政党・地域・期数を埋め込まない
- 並び替え基準が変わってもIDは再採番しない

## 6. 正規化ルール
- 正規値と表示値を兼ねる項目でも、検索や絞り込みに使うものは `code` と `label` を分ける
- `party` と `parliamentaryGroup` は必ず制御語彙から選ぶ
- 政党名は最低限以下の正式表記と短縮表記を固定する

| code | label | shortLabel |
| --- | --- | --- |
| `ldp` | 自由民主党 | 自民 |
| `cdp` | 立憲民主党 | 立民 |
| `jip` | 日本維新の会 | 維新 |
| `komeito` | 公明党 | 公明 |
| `dpfp` | 国民民主党 | 国民 |
| `jcp` | 日本共産党 | 共産 |
| `reiwa` | れいわ新選組 | れいわ |
| `sanseito` | 参政党 | 参政 |
| `yushi` | 有志の会 | 有志 |
| `independent` | 無所属 | 無所属 |
| `other` | その他 | その他 |

- 会派は政党と一致するとは限らないため別キーで持つ
- 選出区分は `election.electedVia` と `election.candidacyType` を分ける
- `electedVia` は結果、`candidacyType` は立候補形態
- 重複立候補は `candidacyType = "dual"` とし、実際の当選経路は `electedVia` に入れる
- 小選挙区当選なら `districtName` 必須
- 比例復活や比例単独なら `proportionalBlock` 必須
- `prefectureCode` `prefectureLabel` は小選挙区から一意に定まる時だけ入れる
- 比例単独で都道府県が一意に定まらない場合は `null`
- 生年月日は `YYYY-MM-DD` 固定
- PDFに年齢だけあり生年月日がない場合でも、年齢は `age` に入れてよい。ただし `ageAsOf` と `verification.comment` を付ける
- `careers` `titles` `roles` `notes` は配列固定
- 1配列要素に1意味だけ入れる
- 元データの言い回しを残したい場合は `source.raw` に保存し、正規値側では同義語を統一する

## 7. PDFから抽出する時の注意点
- まず PDF のどの欄をどのキーに写すかを固定してから作業する
- 氏名は見出し、かなはふりがな欄、経歴は略歴欄と、抽出元欄を混ぜない
- OCRで全角数字と半角数字、漢数字、ハイフン、長音が崩れやすい
- `1` と `I`、`0` と `O`、`ー` と `-`、`髙` と `高` の誤認を重点確認する
- 政党と会派は別欄なら必ず別々に取る
- 小選挙区当選か比例復活かは見出しだけで判断せず、当選区分欄を優先する
- 重複立候補は `districtName` と `proportionalBlock` の両方を確認する
- 当選回数は肩書きや経歴文中ではなく、明示欄を優先する
- 生年月日と年齢が両方ある時は両方保持し、年齢差異があれば `verification.comment` に残す
- 改行をそのまま1文字列へ流し込まない。箇条書き単位に切る
- OCR結果をそのまま正規値へ入れず、必ず表記ルールに合わせる
- 正規化で迷った項目は `source.raw` に原文を残す
- 画像切り出しが不鮮明でも、本人確認できないなら `photo.isPlaceholder = true` のままにする
- PDFページ番号は見開き表記ではなく、実ファイル上のページ番号で記録する

## 8. 完成見本20名を固定するための確認項目
- 必須キーが全件そろっている
- 空文字が1件もない
- `id`、JSON名、画像名、index参照が一致している
- 政党・会派・選出区分のコードが制御語彙に一致している
- `party.label` と `party.shortLabel` がマスタ定義どおり
- `parliamentaryGroup` の正式表記と短縮表記が全件統一されている
- `election.electedVia` と `election.candidacyType` の組み合わせが矛盾していない
- 小選挙区ありの人は `districtName` と `prefectureLabel` が整合している
- 比例代表ありの人は `proportionalBlock` が正式表記にそろっている
- `termsWon`、`age`、`source.pages` が数値型で入っている
- `birthDate`、`ageAsOf`、`updatedAt` が ISO日付形式
- `careers` `titles` `roles` `notes` に改行入り長文がない
- `photo.exists` と実ファイルの有無が一致している
- `photo.isPlaceholder = true` の人は `verification.status = verified` になっていない
- `verification.uncertainFields` が空でないのに `verified` になっていない
- `source.raw` が必要な人だけに付き、原文と正規値の対応が追える
- 20名の中で姓と名の分割基準が揺れていない

## 9. 50名ずつ量産する時のチェックリスト
- 作業開始前にマスタ表記を更新し、途中で勝手に増やさない
- 新規50名を入れる前に既存20名へ同じルール違反がないか再検査する
- 1件ごとに `draft` で保存し、まとめて `reviewed` へ上げる
- `verified` への更新は相互確認後だけにする
- 空文字、全角半角混在、独自略称を機械チェックする
- 政党変更や会派変更があった人を、古い完成見本からコピペしない
- 比例復活と比例単独を混同しない
- `age` は前バッチからコピペせず、基準日付きで見直す
- プレースホルダー画像のまま量産完了扱いにしない
- `source.pages` を全件入れ、後追い確認不能データを作らない
- `verification.uncertainFields` が残った件数をバッチ単位で把握する
- index用の軽量データと詳細JSONの値ズレを検出する
- バッチ完了時にID重複、欠番、画像欠落、制御語彙外コードを検査する
- 量産途中でルール変更が出たら、先に20名見本へ反映してから50名へ広げる

## 10. サンプルJSON（1名分）

```json
{
  "id": "hr-0001",
  "name": {
    "display": "岸田 文雄",
    "kana": "きしだ ふみお",
    "family": "岸田",
    "given": "文雄",
    "familyKana": "きしだ",
    "givenKana": "ふみお"
  },
  "photo": {
    "path": "/data/photos/hr-0001.jpg",
    "exists": true,
    "isPlaceholder": false,
    "originalSource": "衆議院議員名鑑PDF"
  },
  "party": {
    "code": "ldp",
    "label": "自由民主党",
    "shortLabel": "自民"
  },
  "parliamentaryGroup": {
    "code": "jiyuminshuto_musyokuzoku_no_kai",
    "label": "自由民主党・無所属の会",
    "shortLabel": "自民"
  },
  "election": {
    "electedVia": "single",
    "candidacyType": "dual",
    "districtName": "広島1区",
    "proportionalBlock": "中国",
    "prefectureCode": "34",
    "prefectureLabel": "広島県"
  },
  "termsWon": 10,
  "birthDate": "1957-07-29",
  "age": 68,
  "ageAsOf": "2026-03-23",
  "careers": [
    "元内閣総理大臣",
    "元外務大臣"
  ],
  "titles": [
    "衆議院議員"
  ],
  "roles": [
    "自由民主党総裁"
  ],
  "source": {
    "pdfPath": "/data/sources/members.pdf",
    "pages": [
      12
    ],
    "accessedOn": "2026-03-23",
    "raw": {
      "name": "岸田文雄",
      "party": "自由民主党",
      "parliamentaryGroup": "自由民主党・無所属の会",
      "district": "広島1区",
      "proportionalBlock": "中国",
      "termsWon": "10回",
      "birthDate": "昭和32年7月29日生",
      "age": "68歳"
    }
  },
  "notes": [
    "年齢はPDF記載値を採用"
  ],
  "updatedAt": "2026-03-23",
  "verification": {
    "status": "reviewed",
    "uncertainFields": [],
    "comment": null
  }
}
```

## 11. 危険なブレポイント3つ
- 政党と会派を同じものとして扱い始めること。後から絞り込み条件と表示が壊れる
- `single` / `proportional` だけで済ませて重複立候補情報を落とすこと。比例復活の判定が後でできなくなる
- 空文字と `null` を混在させること。検索、バリデーション、未入力判定が全部不安定になる

## 12. このルールでまだ足りない点3つ
- 政党マスタと会派マスタの実ファイル化がまだ必要
- index用軽量JSONの正式キー定義がまだ必要
- バリデータ実装がまだ最小版なので、新ルールに合わせた機械検査の拡張が必要
