# Video Call Under Bad Networks

## Objective

Transmit generated 30 fps frames through a serialized link; apply deadlines, jitter buffering and optional bitrate adaptation.

## Prerequisites and required skills

JavaScript queues, Mbps-to-frame transmission time, UDP loss and jitter.

## Setup and run

From the repository root: `npm start, then open http://localhost:3000/#video`. Browser projects require Node 18+ for local serving; Java requires JDK 17+. No npm packages are needed.

## Implementation

The algorithm is exported from `index.js`; the shared browser controls are in `../../web/app.js`. Import the module directly for your own experiments.

## Required experiments

Compare 20/5/1 Mbps links and 0/1/5 percent loss. Record played, late and lost frames with adaptation on and off.

## Deliverables

- Working source and a reproducible demonstration.
- Exported measurements or Java run output.
- A report explaining protocol behavior, observed failures, alternative explanations and model limitations.

## Validation

Run `npm run check` at the repository root. JavaScript behavioral tests are in `tests/labs.test.mjs`; Java security checks execute in `Main`.

## Model limitations

One frame is one datagram. Receiver animation illustrates outcomes rather than decoding a real media stream.
