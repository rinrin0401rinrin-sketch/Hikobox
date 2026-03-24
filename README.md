# 衆議院議員単語帳アプリ

完成見本1名を基準に、20名・50名単位で安全に拡張するための土台を整えた最小実装です。

## 使い方
- ローカルサーバー起動: `python3 -m http.server 8000`
- ブラウザで表示: `http://localhost:8000`
- データ検証: `npm run validate`
- テスト: `npm test`

## 今回の前提
- 参照 PDF と正式写真はまだ未配置
- `data/members/hr-0001.json` は `draft` の完成見本
- 正式投入前に `party` `district/block` `career` `sourcePdf` `sourcePage` を確認して差し替える

## 次段階
1. 参照 PDF の保存場所を固定する
2. 完成見本1名を実在議員データへ更新する
3. 20名バッチに向けて表記ルールを固める
