# レビュー手順書

## 目的
- `batch-00-sample` の完成見本1名を、途中で止めても再開できる形で確認する
- 20名、50名の量産時にもそのまま使える確認手順の土台にする

## 対象ファイル
- `data/batches/batch-00-sample/manifest.json`
- `data/batches/batch-00-sample/review.tsv`
- `data/members/hr-0001.json`
- `data/photos/hr-0001.jpg`
- `data/members/index.json`

## 最初にやること
1. `data/batches/batch-00-sample/review.tsv` を開く
2. 対象IDが `hr-0001` であることを確認する
3. `manifest.json` の `memberIds` と `review.tsv` の `id` が一致していることを確認する
4. 今回の担当者名と日付を決める

## review.tsv の列定義
- `id`: 対象議員ID
- `photo`: 写真の本人確認結果。`todo` `ok` `ng`
- `name`: 氏名表記確認結果。`todo` `ok` `ng`
- `party`: 党派確認結果。`todo` `ok` `ng`
- `election`: 選出区分確認結果。`todo` `ok` `ng`
- `district_block`: 小選挙区または比例ブロック確認結果。`todo` `ok` `ng`
- `career`: 経歴確認結果。`todo` `ok` `ng`
- `json`: JSON構造確認結果。`todo` `ok` `ng`
- `ui`: UI表示確認結果。`todo` `ok` `ng`
- `reviewer`: 最終確認者名
- `result`: 行全体の判定。`todo` `draft-ok` `verified`
- `notes`: 補足メモ、TODO、保留理由

## 実行手順
1. `data/members/hr-0001.json` を見て、ID、氏名、党派、選出区分、選挙区またはブロック、経歴、`status` を確認する
2. `data/photos/hr-0001.jpg` を見て、本人写真として使えるかを確認する
3. PDF または元資料と照合し、確定できた列を `ok` に更新する
4. 確定できない列は `todo` のままにし、`notes` に不足理由を書く
5. `npm run validate` を実行し、エラーがあれば `json` を `ng` にして内容を `notes` に書く
6. `npm test` を実行し、失敗した場合は `ui` か `json` を `ng` にして原因を記録する
7. ブラウザで単語帳UIを開き、表面、裏面、前へ、次へ、一覧遷移を確認する
8. 問題がなければ `json` と `ui` を `ok` に更新する
9. 主要列がすべて `ok` になったら `result` を `verified` にする
10. `status` を `verified` に上げた場合は、`reviewer` と日付を `notes` に残す

## 途中停止ルール
- 1項目でも未確認があれば `result` は `todo` または `draft-ok` のままにする
- 推測で埋めない
- `notes` を空欄のまま止めない
- 中断前に `git diff` またはファイル差分を確認する

## 再開ルール
1. `review.tsv` の `result` が `verified` でない行を開く
2. `notes` を見て未処理項目を確認する
3. `manifest.json` と `index.json` に対象IDのズレがないか確認する
4. 途中で写真やJSONを差し替えていた場合は、先に `npm run validate` を再実行する

## 完了条件
- `review.tsv` の対象行で主要列がすべて `ok`
- `result` が `verified`
- `data/members/hr-0001.json` の `status` が `verified`
- `npm run validate` が通る
- `npm test` が通る
- UI の基本操作が目視で確認済み

## 20名フェーズへ持ち上げる時の使い方
- 行を追加して同じ列を使う
- 5名ずつ確認し、各5名の終了時に validate と差分確認を行う
- 列を増やしたくなったら、先に `docs/rules.md` とこのファイルを更新してから追加する

## 50名テンプレートの使い方
- `data/batches/batch-02-50/groups.template.json` に実名配分を入れる
- `data/batches/batch-02-50/roster.template.json` の `slot` ごとに `name` `groupId` `sourcePage` を埋める
- `data/batches/batch-02-50/worklist.template.tsv` を日次作業台帳として使う
- `data/batches/batch-02-50/review.template.tsv` をレビュー記録として使う
- 実データ投入後は template ファイルを複製して、拡張子 `.template` を外した運用ファイルへ切り替える
- batch-02-50 はすでに運用ファイル `groups.json` `roster.json` `worklist.tsv` `review.tsv` に切り替わっている
- 保留が出た件は `g04-hold` へ逃がし、他の49件の流れを止めない
