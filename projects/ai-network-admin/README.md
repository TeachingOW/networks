# AI Network Administrator

## Objective

Parse JSON incidents or HAR, run diagnostic rules and a Laplace-smoothed categorical Naive Bayes classifier.

## Prerequisites and required skills

JSON/HAR, DNS/TCP/TLS/HTTP stages, basic probability and labeled evaluation.

## Setup and run

From the repository root: `npm start, then open http://localhost:3000/#admin`. Browser projects require Node 18+ for local serving; Java requires JDK 17+. No npm packages are needed.

## Implementation

The algorithm is exported from `index.js`; the shared browser controls are in `../../web/app.js`. Import the module directly for your own experiments.

## Required experiments

Supply independent labeled incidents; inspect accuracy and confusion counts, including cases where model and rules disagree.

## Deliverables

- Working source and a reproducible demonstration.
- Exported measurements or Java run output.
- A report explaining protocol behavior, observed failures, alternative explanations and model limitations.

## Validation

Run `npm run check` at the repository root. JavaScript behavioral tests are in `tests/labs.test.mjs`; Java security checks execute in `Main`.

## Model limitations

Included examples are synthetic. Small model scores are not calibrated confidence. HAR does not prove outcomes for protocol stages it does not record.
