# 衆議院議員単語帳アプリ 仕様メモ

## 目的
- 衆議院議員465名を顔写真つき単語帳UIで学習できるようにする
- 完成見本1名を基準に、20名、50名単位で安全に拡張する
- PDFは参照元にとどめ、正規データは `data/` 配下の JSON で管理する

## 現在の基準見本
- 完成見本は `hr-0001` 青山繁晴
- ステータスは `verified`
- 画像は `/data/photos/hr-0001.jpg`
- 参照元は `/data/source-pdf/members.pdf` の 4 ページ
- 今後の20名追加は、この1名の表記・命名・出典記録をそのまま踏襲する

## 今回までに固めた範囲
- JSON 1件を読み込む単語帳カードUI
- 一覧画面と絞り込みUIの土台
- `index.json` を使う一覧用データ分離
- `batch-00-sample` `batch-01-20` `batch-02-50` のバッチ構成
- 検証スクリプトによる基本整合性チェック

## 非目標
- 465名分の一括量産
- PDF からの自動大量抽出
- 学習済み、苦手登録、ランダムの本実装
- 管理画面や CMS の構築

## データの正規配置
- メンバー詳細: `data/members/hr-0001.json`
- メンバー一覧: `data/members/index.json`
- 写真: `data/photos/hr-0001.jpg`
- 出典 PDF: `data/source-pdf/members.pdf`
- バッチ管理: `data/batches/*/manifest.json`

## JSON スキーマ
```json
{
  "id": "hr-0001",
  "name": "氏名",
  "nameKana": "",
  "party": "政党名",
  "electionType": "single",
  "district": "",
  "block": "",
  "prefecture": "",
  "wins": 0,
  "birthDate": "",
  "age": null,
  "career": [],
  "photo": "/data/photos/hr-0001.jpg",
  "sourcePdf": "/data/source-pdf/members.pdf",
  "sourcePage": 4,
  "status": "draft",
  "notes": ""
}
```

## 画面構成
### 学習画面
- 表面: 顔写真、氏名、政党
- 裏面: 選出区分、選挙区または比例ブロック、当選回数、主な経歴、補足メモ
- 操作: 前へ、次へ、めくる
- 将来拡張用の土台: ランダム、学習済み、苦手登録

### 一覧画面
- 写真サムネイル
- 氏名
- 政党
- 選出区分
- 詳細カードへ遷移する導線

### 絞り込み
- 政党
- 選出区分
- 都道府県
- 比例ブロック

## index.json の役割
- 一覧画面用の軽量データをまとめる
- 各議員 JSON への `memberPath` を持たせる
- フィルタに必要な最小項目を先に読めるようにする

## バッチ方針
- `batch-00-sample`: 青山繁晴の完成見本1名
- `batch-01-20`: 検証用20名
- `batch-02-50`: 50名追加の最初の標準バッチ
- 以降は50名単位を基本にし、端数は別バッチに分ける

## 現時点の判断
- 完成見本1名は差し替え段階を終えた
- 以後はこの見本を壊さず、追加分を同じルールで増やす
- スキーマ変更が必要になった場合は、まず `hr-0001` と docs を更新してから他件へ広げる
