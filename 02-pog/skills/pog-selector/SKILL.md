---
name: pog-selector
description: Research, rank, and refine Japanese POG draft horses for a specific season using only public information. Use when Codex is asked to build longlists, risk-review popular horses, merge multiple candidate lists, or finalize a 30-horse POG board with emphasis on turf aptitude, early debut likelihood, and realistic probability of earning at least one win by the Japanese Derby.
---

# POG Selector

Use this skill for Japanese POG work where the real goal is not hype alone but practical win probability.

Default assumption:

- target season is a specific foal crop such as `2024年産`
- focus is `芝`
- latest acceptable debut is `10月末`
- selection priority is `ダービーまでに最低1勝`

## Workflow

1. Lock the scope and scoring rules.
2. Gather public, recent information for likely candidates.
3. Separate `本命候補` from `リスク管理`.
4. Merge overlapping names and downgrade fragile profiles.
5. Output a ranked board with uncertainty stated explicitly.

## Lock The Scope

Confirm or infer the minimum facts:

- target season
- race window
- turf only or mixed
- desired list size
- whether this pass is longlist, risk review, or final board

If the user already gave these, do not ask again.

## Research Rules

Use only public information and prefer recent sources. Always verify unstable details such as:

- 入厩
- ゲート試験
- 本州移動
- 厩舎コメント
- デビュー予定
- 騎手見込み

Do not invent horse names, stable assignments, owners, or progress updates.

If a fact is unclear, write `不明`.

Always include an explicit confirmation date.

## Selection Heuristics

Prioritize horses that are easier to win with in new-maiden conditions:

- 芝マイルから中距離で使いやすい
- 早期始動の裏付けがある
- 厩舎が2歳戦で動かしやすい
- 育成先、牧場、馬主の安定感がある
- 新馬で負けても未勝利で取り返しやすい

Downgrade horses with:

- ダート色の強さ
- 晩成傾向が強すぎる配合
- 頓挫や脚元不安
- 気性難
- 使える距離や番組の狭さ
- 人気先行で1勝条件に対して割高な期待値

## Merge Logic

When combining multiple lists:

1. Normalize the horse name notation.
2. Treat appearances in both `本命候補` and `リスク管理` as high-interest cases.
3. Raise horses that score well in both upside and practicality.
4. Lower horses that are famous but carry timing or profile risk.
5. Keep the final board balanced between `上位人気` and `地味な実戦型`.

## Scoring

When the user wants numeric scoring, use the standard 100-point model in [references/pog-scoring.md](references/pog-scoring.md).

If the user provided a different rubric, follow the user's rubric first.

## Output Style

Start with the conclusion first.

Use clear tables. Avoid empty cells. Use `不明` instead of guessing.

For final boards, read [references/output-shapes.md](references/output-shapes.md) and match the closest format:

- 一次抽出40頭
- 危険馬20頭
- 最終30頭
- 補欠10頭

## Quality Bar

Before finishing, check:

- every horse fits the season and race window
- every horse is turf-leaning enough for the request
- popular horses were not kept on bloodline alone
- practical maiden-winning candidates are included
- uncertainty is surfaced, not hidden

