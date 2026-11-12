# Network Detective

## Objective

Generate or import measurements, compare with a baseline, and report evidence-based hypotheses.

## Prerequisites and required skills

JavaScript arrays, descriptive statistics, RTT versus one-way delay, loss fractions.

## Setup and run

From the repository root: `npm start, then open http://localhost:3000/#detective`. Browser projects require Node 18+ for local serving; Java requires JDK 17+. No npm packages are needed.

## Implementation

The algorithm is exported from `index.js`; the shared browser controls are in `../../web/app.js`. Import the module directly for your own experiments.

## Required experiments

Run healthy, congestion, loss and jitter scenarios with the same seed. Export reports and compare false alarms.

## Deliverables

- Working source and a reproducible demonstration.
- Exported measurements or Java run output.
- A report explaining protocol behavior, observed failures, alternative explanations and model limitations.

## Validation

Run `npm run check` at the repository root. JavaScript behavioral tests are in `tests/labs.test.mjs`; Java security checks execute in `Main`.

## Model limitations

Measurements are synthetic; thresholds are heuristics, and hypotheses do not establish root cause.
