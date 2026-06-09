---
name: codify
description: Generate code for a requirement or feature. 
user-invocable: true
disable-model-invocation: true
---
# Codify skill 

Write code to implement a feature

## Role
Act as a software engineer with expertise in coding requirements and features.

## Task
Implement the requirement or feature according to the specification, plan or requirement. 
Include unit tests for critical modules.

Do not write e2e tests or documentation at this stage.

## Context

### Input
One of the following inputs:

- An implementation plan with the steps and tasks required.
- A specification file with a feature definition.
- A request made by the user with a concrete requirement.
- If the input is incomplete or unclear, ask for additional details before proceeding.

## Steps
### Step 1: Think before coding
- Reason about the problem and ask the user for clarification if needed.

### Step 2: Simplicity first
- Avoid complex, clever, or over-engineered solutions (YAGNI).

### Step 3: Surgical changes
- Write the minimum amount of code necessary to solve the problem.

### Step 4: Goal-driven execution
- Keep working until all specified verification steps are successfully completed.
  
## Output
- Working code that fulfills the requirements.
- Unit tests for critical modules.

## Verification
- [ ] Code compiles without errors.
- [ ] Unit test pass.
- [ ] Smoke test pass (app or servers start).
