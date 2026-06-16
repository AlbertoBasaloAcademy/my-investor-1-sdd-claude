Use the architect agent to document this repository

/specify the notifications feature: operators are notified when a launch reaches its minimum occupancy threshold, and passengers are notified when a launch they booked is suspended or canceled.

Use the builder agent to build @feat-launch-notifications/spec.md

---

> The session in one sentence: stop driving skills one by one and delegate **whole phases** to subagents — but only the phases bounded by a human gate on each side.
>
> 1. **Architect AFK**: `/explore` + `/extract` ×container is mechanical once the mode is detected — the perfect first delegation. Output is docs, so the worst case is cheap. Human gate at the exit: read the arch docs before specifying on top of them.
> 2. **Spec approval is THE gate**: `/specify` stays interactive — the spec is the contract between human intent and everything the builder will do alone. Read it. Approve it. *Then* go AFK.
> 3. **Builder AFK**: `/planify` → `/codify` ×container → `/verify` loop until green. Safe to delegate because the proof is manufactured, not promised: the e2e suite verifies the builder's own work against the approved criteria. Human gates at the exit: `/review` and `/release` stay human-triggered.
>
> Setup and mechanics to demo live:
>
> - Copy `agents/*.md` to `.claude/agents/`. Required prerequisite: the skills an agent preloads (`skills:` frontmatter) must NOT have `disable-model-invocation: true` — that flag also blocks preloading. Flipping it is the deliberate knob between "skills only I trigger" and "skills an agent may run".
> - `background: true` = concurrent and AFK, but background agents auto-deny permission prompts — hence `permissionMode: acceptEdits` and the "never ask, document assumptions" rule in both prompts. `maxTurns` is the dead-man's switch.
> - Ctrl+B backgrounds any running task; `@agent-architect` / `@agent-builder` target them explicitly.
> - Monitoring is the artifacts, not the terminal: watch plan checkboxes, spec `status`, criteria `[x]`, and `e2e.report.md` evolve — the pipeline's paperwork doubles as the progress UI.
> - Known limit: a subagent cannot spawn subagents, so the builder codifies containers sequentially. The parallel variant is orchestrating from the main session — one codify worker per container plan — at the cost of you being the orchestrator again.
