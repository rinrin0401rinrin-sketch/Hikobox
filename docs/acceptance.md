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
- `data/members/index.json` とバッチ manifest がある
- `scripts/validate-members.js` がある
- validate で以下を検知できる
  - 必須項目不足
  - ID 重複
  - 写真ファイル欠落
  - 出典 PDF 欠落
  - `electionType` と `district/block` の不整合

## 次段階へ進める条件
- 20名追加時に同じ JSON スキーマをそのまま使える
- `draft` と `verified` の運用ルールが docs に固定されている
- 青山繁晴の完成見本を見れば、追加時の粒度と書き方がわかる
- 追加作業が差分で追える
