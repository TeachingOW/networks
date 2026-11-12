# Multiplayer Game Networking

## Objective

Send movement commands, return authoritative snapshots, reject stale sequences and reconcile predicted input.

## Prerequisites and required skills

JavaScript event queues, sequence numbers, client/server authority and simulated time.

## Setup and run

From the repository root: `npm start, then open http://localhost:3000/#game`. Browser projects require Node 18+ for local serving; Java requires JDK 17+. No npm packages are needed.

## Implementation

The algorithm is exported from `index.js`; the shared browser controls are in `../../web/app.js`. Import the module directly for your own experiments.

## Required experiments

Compare 0/50/150/300 ms one-way delay and 0/5 percent loss for UDP and ordered TCP approximations.

## Deliverables

- Working source and a reproducible demonstration.
- Exported measurements or Java run output.
- A report explaining protocol behavior, observed failures, alternative explanations and model limitations.

## Validation

Run `npm run check` at the repository root. JavaScript behavioral tests are in `tests/labs.test.mjs`; Java security checks execute in `Main`.

## Model limitations

Scripted clients run in one process. TCP retransmission is a simplified 200 ms penalty. The opponent is scripted; snapshots are not real multiplayer traffic.
