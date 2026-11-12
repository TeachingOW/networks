# Mini Content Delivery Network

## Objective

Run a seeded content workload through three capacity-limited edge caches with five selection strategies.

## Prerequisites and required skills

HTTP caching, Map insertion order, LRU/FIFO and queueing.

## Setup and run

From the repository root: `npm start, then open http://localhost:3000/#cdn`. Browser projects require Node 18+ for local serving; Java requires JDK 17+. No npm packages are needed.

## Implementation

The algorithm is exported from `index.js`; the shared browser controls are in `../../web/app.js`. Import the module directly for your own experiments.

## Required experiments

Export all ten strategy/policy comparisons; vary capacity and explain hit ratio, origin requests and average latency.

## Deliverables

- Working source and a reproducible demonstration.
- Exported measurements or Java run output.
- A report explaining protocol behavior, observed failures, alternative explanations and model limitations.

## Validation

Run `npm run check` at the repository root. JavaScript behavioral tests are in `tests/labs.test.mjs`; Java security checks execute in `Main`.

## Model limitations

Atomic cache fills omit asynchronous fetch overlap; latency and service costs are synthetic. Capacity counts objects, not bytes.
