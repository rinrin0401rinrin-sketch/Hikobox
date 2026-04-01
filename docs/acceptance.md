# 受け入れ基準

## 今回の基準状態
- 完成見本1名は青山繁晴で確定している
- `data/members/hr-0001.json` は `verified`
- 画像、JSON、一覧、出典 PDF の参照が成立している

## 完成見本1名の合格条件
- `data/members/hr-0001.json` が存在する
- `data/photos/hr-0001.jpg` が存在し、JSON の `photo` と一致する
- `data/source-pdf/members.pdf` が存在し、JSON の `sourcePdf` と一致する
- `sourcePage` が入っている
- 単語帳カードの表面と裏面が切り替わる
- `前へ` `次へ` `めくる` が動作する
- 一覧から詳細カードへ移動できる
- スマホ幅でも大きく崩れない

## 土台の合格条件
- `docs/spec.md` `docs/rules.md` `docs/acceptance.md` `docs/batch-plan.md` がある
- `docs/spec-465-pwa.md` があり、iPhone / PWA 前提の判断が文書化されている
- `data/members/index.json` とバッチ manifest がある
- `scripts/validate-members.js` がある
- `scripts/audit-members.js` がある
- validate で以下を検知できる
  - 必須項目不足
  - ID 重複
  - 写真ファイル欠落
  - 出典 PDF 欠落
  - `electionType` と `district/block` の不整合

## batch-01-20 の現状
- 20名分の JSON と写真が `data/` にそろっている
- review 台帳が存在する
- validate は通過済み
- 初期表示、前へ/次へ、めくる、絞り込み、狭幅確認まで完了している

## 次段階へ進める条件
- 20名追加時に同じ JSON スキーマをそのまま使える
- `draft` と `verified` の運用ルールが docs に固定されている
- 青山繁晴の完成見本を見れば、追加時の粒度と書き方がわかる
- 追加作業が差分で追える
- 20名セットを基準に batch-02-50 へ進める

## PWA / iPhone 受け入れ条件
- `小選挙区` `比例代表` `検索` の3タブがある
- 小選挙区は都道府県から選挙区へ辿れる
- 比例代表はブロック単位で辿れる
- 検索で氏名、政党、都道府県、区分の複合絞り込みができる
- 0件時の空状態がある
- 再読込後に直前タブと主な検索条件が復元される
- 表裏カードが切り替わる
- `manifest.webmanifest` と `sw.js` が存在する
- ホーム画面追加の案内が表示できる
- Mac Safari の狭幅確認か iPhone 実機確認のどちらかを行う

## batch-02-50 の現在位置
- `hr-0021` から `hr-0040` は UI 確認まで完了し、台帳上も `verified`
- `hr-0041` から `hr-0060` は source 確認と `career` 反映まで完了し、UI 確認待ち
- `hr-0061` から `hr-0070` は `draft-loaded` のままで、次チャンクの対象
