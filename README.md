# 衆議院議員単語帳アプリ

完成見本1名を基準に、20名・50名単位で安全に拡張するための土台を整えた最小実装です。

## 現在の完成見本
- `hr-0001`: 青山繁晴
- `status`: `verified`
- `photo`: `/data/photos/hr-0001.jpg`
- `sourcePdf`: `/data/source-pdf/members.pdf`
- `sourcePage`: `4`

## 使い方
- ローカルサーバー起動: `python3 -m http.server 8000`
- ブラウザで表示: `http://localhost:8000`
- データ検証: `npm run validate`
- テスト: `npm test`

## 次段階
1. batch-01-20 の候補20名を選ぶ
2. 青山繁晴の完成見本と同じルールで 20 名を追加する
3. 表記ゆれが出たら docs と完成見本を先に直す
