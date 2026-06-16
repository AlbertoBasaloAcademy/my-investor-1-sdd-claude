# Primitives: commands, skills, rules, subagents — and hooks

Claude Code gives you four ways to put your own instructions in front of the model, plus one way to run code *around* it. The first four are **advisory** — they instruct a probabilistic model that may or may not comply. The fifth, **hooks**, is **deterministic** — shell code the runtime executes on lifecycle events, no matter what the model decides. Each answers a different question:

| Primitive | Answers | One-line definition |
|---|---|---|
| **Command** | "Run *this* now." | A user-triggered prompt macro injected into the current turn. |
| **Skill** | "*How* do I do X?" | A model-invocable procedure, loaded only when relevant. |
| **Rule** | "What must always hold?" | Standing constraints and context, never *invoked*. |
| **Subagent** | "Do *that whole job* elsewhere." | A worker with its own context window that returns a report. |
| **Hook** | "*Guarantee* it." | A shell command bound to a lifecycle event — code, not a prompt. |

A useful mental model: **rules** are the law (always in force), **skills** are the manuals on the shelf (pulled when needed), **commands** are the buttons you press, **subagents** are the colleagues you hand a task to — and **hooks** are the building's automatic fire doors: they trigger on an event whether or not anyone read the law.

## The comparison that matters

| Axis | Command | Skill | Rule | Subagent | Hook |
|---|---|---|---|---|---|
| Lives in | `.claude/commands/*.md` | `.claude/skills/*/SKILL.md` | `CLAUDE.md` / `AGENTS.md`, `rules/*.md` | `.claude/agents/*.md` | `.claude/settings.json` (+ scripts) |
| Who triggers it | **Human** (`/name`) | **Model** (and optionally human) | Nobody — it's ambient | **Main agent** (or `@agent-name`) | **The runtime**, on an event |
| When it loads | On invocation | Name+description always; body **on demand** | Always, or when matching files are touched | On delegation | On a lifecycle event (e.g. `PreToolUse`) |
| Nature | Advisory | Advisory | Advisory | Advisory | **Deterministic (code)** |
| Context window | Current session | Current session | Current session | **Its own, isolated** | Runs outside the model; can inject in |
| Shape | A prompt | A procedure + bundled assets/scripts | Declarative constraints | A system prompt + tools + permissions | A shell command + event matcher |
| Returns | Inlined into the chat | Inlined into the chat | — | A **report** only | Exit code / JSON: allow, **block**, or inject |
| Reusable across projects | Copy the file | Copy the folder (portable by design) | Project-specific (or `~/.claude`) | Copy the file | Copy the settings block + script |

The three axes that drive almost every design decision: **who pulls it in** (human vs. model vs. always-on vs. an event), **whose context window it costs** (yours vs. a fresh one vs. none), and **whether it advises or enforces** (the first four ask the model nicely; a hook is the only one that *guarantees*).

## Command — the button

A markdown file whose body is a prompt. The user types `/slug` and the body is injected into the current turn. Supports `$ARGUMENTS` / `$1 $2`, `@file` references, and `!`-prefixed shell.

```markdown
---
description: Open a PR from the current branch
argument-hint: [base-branch]
allowed-tools: Bash(git*), Bash(gh*)
---
Push the current branch and open a PR against `$1`.
Title from the latest commit; body summarizing the diff.
```

**Use a command when** the *human* decides the moment and the instruction is a short, repeatable macro: `/pr`, `/changelog`, `/triage-issue 482`. It is a saved keystroke, not knowledge — there is no progressive disclosure and the model never reaches for it on its own.

## Skill — the manual

A folder with a `SKILL.md` plus optional `references/`, `assets/`, and `scripts/`. Only the `name` + `description` sit in context at all times; the model reads the body **when the description matches the task**, and pulls bundled files only as needed. This *progressive disclosure* is the whole point — you can ship a deep procedure without paying for it on every turn.

```markdown
---
name: explore
description: Set up rules and architecture docs for a project. Greenfield prescribes; brownfield extracts.
user-invocable: true
disable-model-invocation: true
---
# Explore skill
... steps, references to mode guides, templates to fill ...
```

Two frontmatter knobs define *who* may trigger a skill — and they are the seam between skills and subagents:

- `user-invocable: true` → also callable as `/explore`.
- `disable-model-invocation: true` → **human-only**; the model can neither auto-trigger *nor preload* it.

**Use a skill when** the knowledge is a *how-to* the model should apply autonomously and repeatedly: a documented procedure, a coding workflow, a format spec with examples. In this repo, the entire AIDD pipeline (`/explore`, `/extract`, `/specify`, `/planify`, `/codify`, `/verify`, `/review`, `/release`, `/modify`) is skills. They double as commands because they are `user-invocable`.

> Note the overlap: a `user-invocable` skill *is* reachable as a slash command. The difference from a real command is depth — a skill carries bundled assets and is designed for the model to pick up unprompted; a plain command is a one-shot prompt the human always initiates.

## Rule — the law

Standing context that is true regardless of the task. Two flavors:

- **Always-on**: `CLAUDE.md` / `AGENTS.md` at the repo root — project facts, build commands, architecture, conventions. Loaded every session.
- **Path-scoped**: `rules/{container}.rules.md` with a `paths:` glob — pulled in only when the model touches matching files.

```markdown
---
description: Code rules for the front container of MyInvestor
paths: "front/**"
---
# Front code rules
- Components: presentational `.tsx` consuming a `use{Feature}` hook.
- Errors: wrap I/O in try/catch and log.
- Testing: colocated `*.spec.ts` (Vitest).
- Avoid: business logic in components.
```

**Use a rule when** the instruction is a *constraint or fact*, not an action — naming conventions, error handling, "never push", domain glossary. You never "run" a rule; it shapes everything else. Path-scoping is how you keep five containers' worth of conventions out of context until they're relevant.

## Subagent — the colleague

A definition file whose body is a *system prompt* and whose frontmatter is its runtime contract. It runs in its **own context window**, with its own tools, model, and permissions, and returns only a report — your main session stays clean and free.

```markdown
---
name: architect
description: Runs the whole architect phase AFK — /explore then /extract per container.
skills: [explore, extract]
permissionMode: acceptEdits
background: true
maxTurns: 80
---
You are the AIDD architect. Follow the preloaded skills to the letter...
```

| Field | What it buys you |
|---|---|
| `description` | the routing signal — when the main session should delegate |
| `skills` | **preloads full SKILL.md content** at startup (blocked by `disable-model-invocation`) |
| `permissionMode: acceptEdits` | auto-accepts edits — required to run unattended |
| `background: true` | runs concurrently; you keep working |
| `maxTurns` | the dead-man's switch against runaway loops |

**Use a subagent when** you want to delegate a *whole job* and protect your context: a multi-step phase, a noisy search, a parallel fan-out. The cost is isolation — it only knows its prompt, its preloaded skills, `CLAUDE.md`, and the delegation message, *not your conversation*. If a fact matters, it must live in one of those.

## Hook — the guardrail

The other four primitives share one weakness: they are **advice to a probabilistic model**. You can write "never push" in a rule, a skill, and a subagent prompt — and the model can still push, because nothing *stops* it. That is the gap hooks fill. A hook is a shell command the runtime fires on a lifecycle event, evaluated as **code**, so its outcome does not depend on the model reading or obeying anything.

Hooks are configured in `settings.json`, keyed by event and an optional matcher. The events worth knowing: `PreToolUse` (can **block** a tool call before it runs), `PostToolUse` (react after — format, lint, stage), `UserPromptSubmit` and `SessionStart` (inject context), and `Stop` / `SubagentStop` (gate completion). A `PreToolUse` hook that exits non-zero (or returns a `deny` decision) cancels the call and feeds its message back to the model.

### Where it fills a gap: the git case

This repo's background agents are *told*, in prose, "one conventional `docs`/`fix` commit per skill run; **never push**." For an AFK agent on `permissionMode: acceptEdits`, that instruction is the only thing standing between you and a force-push to `main` at 2 a.m. Make it a guarantee instead of a hope:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/guard-git.sh"
          }
        ]
      }
    ]
  }
}
```

```bash
#!/usr/bin/env bash
# .claude/hooks/guard-git.sh — deny pushes and history rewrites, deterministically.
cmd=$(jq -r '.tool_input.command // ""')
if echo "$cmd" | grep -Eq 'git +push|git +commit +.*--no-verify|--force|reset +--hard'; then
  echo "Blocked: pushing/forcing/rewriting is human-only in this repo." >&2
  exit 2   # exit 2 => deny the tool call and tell the model why
fi
exit 0
```

Now "never push" holds for *every* actor — main session, `architect`, `builder` — regardless of prompt drift, context loss, or a clever rationalization. Other natural fits, same principle:

- **`PostToolUse` on `Edit`/`Write`** → run the formatter/linter so style is enforced by code, not nagged for in a rule.
- **`PostToolUse` on `Bash(git commit*)`** → validate the message against Conventional Commits and reject malformed ones.
- **`Stop`** → run the unit suite and refuse to end the turn while it's red.
- **`PreToolUse`** → block edits to `specs/*/spec.md` once a spec is `done` (the lifecycle's "specs are immutable" rule, made unbreakable).

**Use a hook when** a rule *must* hold rather than *should* — safety rails, irreversible actions, compliance, deterministic side effects (formatting, staging, test gates). It is the only primitive that converts an instruction into an invariant. The trade-off: it is plumbing, not knowledge — keep the *why* in a rule and let the hook enforce the *what*.

## How they compose (this repo, end to end)

The primitives stack rather than compete:

1. **Rules** (`CLAUDE.md`, `rules/*.md`) set the always-true ground truth.
2. **Skills** encode each repeatable phase of the pipeline.
3. **Commands** = those same skills, `user-invocable`, when the human drives one step at a time.
4. **Subagents** (`architect`, `builder`) chain whole runs of skills AFK, gated by humans on each side.
5. **Hooks** turn the load-bearing rules into invariants — "never push", "Conventional Commits", "don't touch a `done` spec" — so the AFK agents *cannot* violate them, not merely *shouldn't*.

The seam between "human runs it" and "an agent runs it" is a single skill flag: removing `disable-model-invocation` from `explore`/`extract`/`planify`/`codify`/`verify` is exactly what lets the `architect` and `builder` preload and chain them. `review`, `release`, and `modify` keep the flag — they stay human gates. Hooks back those gates with code: a prompt says "never run `/release` yourself"; a `PreToolUse` hook makes the push it would trigger impossible.

## Choosing — a decision flow

1. Must it be **guaranteed**, not just followed (safety, irreversible actions, deterministic side effects)? → **Hook**.
2. Is it a **constraint or fact** that's always true? → **Rule** (`CLAUDE.md`, or path-scoped for per-area conventions).
3. Is it a **reusable procedure** the model should apply on its own? → **Skill** (add `user-invocable` if you also want a slash trigger).
4. Is it a **one-off prompt the human always initiates**? → **Command**.
5. Is it a **whole job to run elsewhere** to protect context or run in parallel/AFK? → **Subagent** (compose it from skills).

Rule of thumb: if the cost of the model ignoring the instruction is *annoying*, a rule is enough; if it's *unacceptable*, add a hook.

## Common anti-patterns

- **Procedure in a rule.** `CLAUDE.md` bloats with step-by-step how-tos that belong in a skill — paid on every turn, triggered never. Move it to a skill and let progressive disclosure do its job.
- **Rule in a command.** Conventions buried in a slash command only apply when someone remembers to run it. Constraints belong in rules so they're always in force.
- **Subagent for a one-liner.** Spinning up an isolated context to do one edit just adds a report round-trip. Delegate *jobs*, not steps.
- **Forgetting the isolation tax.** A subagent that needs a fact you only said in chat will guess. Put the fact in its prompt, its skills, or `CLAUDE.md`.
- **Trusting a rule for a hard guarantee.** "Never push" in prose is advice an AFK agent can rationalize away. If the failure mode is unacceptable, enforce it with a hook — and keep the rule too, so the *why* is visible.
- **Logic in a hook.** A hook that tries to make judgment calls ("is this a good commit?") fights the model instead of guarding it. Hooks decide *allow/block/format*; leave the reasoning to skills and prompts.

See [skills.agents.md](./skills.agents.md) and [delegation.md](./delegation.md) for the delegation mechanics, and [skills.catalog.md](../5-modify/skills.catalog.md) / [skills.lifecycle.md](../5-modify/skills.lifecycle.md) for the pipeline these primitives drive.
