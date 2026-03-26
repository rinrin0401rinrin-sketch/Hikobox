# batch-02-50 実行手順

## 目的
- `batch-02-50` を `10名 x 5チャンク` で安全に投入する
- 途中で止めても、`manifest / worklist / review` を見れば再開できる状態を保つ
- AI の編集範囲を狭くし、人の確認量を一定に保つ

## 着手条件
- `batch-01-20` の `review.tsv` が `ui=ok` まで完了している
- `npm run validate` と `npm test` が通っている
- `batch-02-50` の写真50枚が `data/photos/` に置かれている
- `batch-02-50` の実名、`sourcePage`、グループ分けが固まっている

## 作業単位
- 1回の処理量は `10名`
- チャンクは次の順で固定する
- `chunk-01`: `hr-0021` から `hr-0030`
- `chunk-02`: `hr-0031` から `hr-0040`
- `chunk-03`: `hr-0041` から `hr-0050`
- `chunk-04`: `hr-0051` から `hr-0060`
- `chunk-05`: `hr-0061` から `hr-0070`

## 各チャンクの進め方
1. `manifest.json` の `currentChunkId` を確認する
2. `worklist.tsv` で対象10名の `status=photo-ready` を確認する
3. AI には対象10名の ID だけを渡し、編集可能ファイルを `data/members/` と `data/members/index.json` に限定する
4. AI に JSON 下書きを作らせる
5. 人が PDF と写真で `name / party / election / district_block / career / sourcePage` を確認する
6. `review.tsv` の対象10名を更新する
7. `npm run validate` を実行する
8. `npm test` を実行する
9. UI で対象10名をざっと通し確認する
10. 問題がなければ `worklist.tsv` の `status` を `verified` に上げる
11. `manifest.json` の次チャンクへ進める

## 停止してよい地点
- 10名の JSON 下書き完了直後
- 人確認完了直後
- `validate / test` 完了直後
- `review.tsv` 更新完了直後

## 再開時に見るファイル
- `data/batches/batch-02-50/manifest.json`
- `data/batches/batch-02-50/worklist.tsv`
- `data/batches/batch-02-50/review.tsv`

## AI への指示テンプレート
- 対象は `chunk-0X` の 10名のみ
- 新規フォルダ追加禁止
- 命名変更禁止
- 写真ファイルの上書き禁止
- `data/members/hr-XXXX.json` と `data/members/index.json` 以外を編集しない
- `npm run validate` が通る状態で止める

## 完了条件
- 50名すべての `review.tsv` が埋まっている
- `review.tsv` の `result` が `verified` になっている
- `npm run validate` と `npm test` が通っている
- UI の一覧、めくる、絞り込みで破綻がない
