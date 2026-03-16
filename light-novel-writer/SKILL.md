---
name: light-novel-writer
description: Create, outline, revise, or continue a single novel in Markdown with light-novel-style Japanese prose. Use when Codex is asked to write one self-contained novel, web novel arc, chapter set, synopsis, character sheet, or full manuscript in markdown format, especially for requests mentioning light novels, ラノベ, web novels, chapter drafting, story bibles, or manuscript assembly.
---

# Light Novel Writer

Treat one request as one novel project. Keep all planning, setup, and manuscript output aligned to that single work unless the user explicitly asks for multiple works.

## Workflow

1. Lock the project scope before writing.
2. Build a compact story bible for the current novel.
3. Draft or revise the manuscript in Markdown.
4. Check continuity, pacing, and hook strength before finishing.

## Lock The Project Scope

Confirm or infer the minimum facts required to write coherently:

- premise
- protagonist
- setting
- target length or chapter count
- point of view
- ending direction

If details are missing, make the smallest useful assumptions and state them briefly. Do not stall the workflow for optional worldbuilding.

## Build The Story Bible

Start with a lightweight story bible inside the same Markdown deliverable. Include only details that affect the manuscript directly:

- title
- logline
- core conflict
- protagonist and key supporting cast
- setting rules
- arc progression
- ending promise

For output shape, read [references/markdown-template.md](references/markdown-template.md).

## Write In Light-Novel Style

Use modern, readable Japanese with strong scene momentum. Prefer:

- immediate hooks
- clear emotional stakes
- dialogue-led scenes
- concrete sensory details
- short-to-medium paragraphs
- distinct character voice

Avoid:

- dense literary narration
- abstract exposition blocks
- lore dumps before tension exists
- repetitive inner monologue
- ornamental prose that slows the scene

For tone and prose rules, read [references/light-novel-style.md](references/light-novel-style.md).

## Draft In Markdown

Always deliver the novel material in Markdown. Default to this order unless the user requests a different shape:

1. `#` title
2. story bible sections
3. chapter or scene outline
4. manuscript body
5. revision notes when relevant

Use heading levels consistently. Keep each chapter or scene easy to navigate with `##` or `###` headings.

## Revision Pass

Before finishing, inspect the draft for:

- chapter hooks and chapter-end pull
- character motivation consistency
- escalation of stakes
- redundant scenes or repeated beats
- voice drift
- contradictions in names, abilities, or timeline

If the user asks for a partial deliverable such as outline only, skip full prose but still preserve the same single-novel structure.
