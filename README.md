# 衆議院議員単語帳アプリ

完成見本1名を基準に、20名・50名単位で安全に拡張するための土台を整えた最小実装です。

## 現在の完成見本
- `hr-0001`: 青山繁晴
- `status`: `verified`
- `photo`: `/data/photos/hr-0001.jpg`
- `sourcePdf`: `/data/source-pdf/members.pdf`
- `sourcePage`: `4`

## 現在の進捗
- `batch-01-20` の 20名セットは `data/members/` と `data/photos/` まで投入済み
- `batch-02-50` の 50名セットは `data/members/` と `data/photos/` への投入が完了し、`index.json` と batch 台帳まで同期済み
- `npm run validate` は 70名分で通過済み
- Safari で初期表示、前へ/次へ、めくる、絞り込み、狭幅確認まで実施済み
- `batch-02-50` は `groups.json` `roster.json` `worklist.tsv` `review.tsv` の実運用台帳まで作成済み
- `batch-02-50` は `hr-0060` まで source 確認と `career` 反映が完了し、`hr-0041` から `hr-0060` は UI/目視レビュー待ち

## 使い方
- ローカルサーバー起動: `python3 -m http.server 8000`
- ブラウザで表示: `http://localhost:8000`
- データ検証: `npm run validate`
- テスト: `npm test`

## 次段階
1. `batch-02-50` の `chunk-05` 10名について `career` を PDF 照合で追記する
2. UI で `hr-0041` から `hr-0060` の表示崩れとフィルタ挙動を確認する
3. `g04-hold` の2件は政党・選出区分を優先再確認する
