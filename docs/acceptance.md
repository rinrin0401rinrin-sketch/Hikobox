# 受け入れ基準

## 今回のゴール
- 完成見本1名を最高品質で仕上げる
- 20名・50名拡張前提の土台を整える
- 量産はまだ行わない

## 完成見本1名の合格条件
- `data/members/hr-0001.json` が存在する
- `data/photos/hr-0001.jpg` が存在し、JSON の `photo` と一致する
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
  - `electionType` と `district/block` の不整合

## 次段階へ進める条件
- 20名追加時に同じ JSON スキーマをそのまま使える
- `draft` と `verified` の運用ルールが明文化されている
- 追加作業が差分で追える
- 推測値が混ざっても `TODO` と `draft` で判別できる
