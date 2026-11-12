# Build Your Own Mini Internet

## Objective

Edit hosts, gateways, DNS records, links and static routes. Use longest-prefix matching and verify both request and reply.

## Prerequisites and required skills

IPv4 addresses, CIDR masks, routing tables, JSON editing.

## Setup and run

From the repository root: `npm start, then open http://localhost:3000/#internet`. Browser projects require Node 18+ for local serving; Java requires JDK 17+. No npm packages are needed.

## Implementation

The algorithm is exported from `index.js`; the shared browser controls are in `../../web/app.js`. Import the module directly for your own experiments.

## Required experiments

Remove r1–r3, reroute through r2 in both directions, and demonstrate a routing loop and missing DNS record.

## Deliverables

- Working source and a reproducible demonstration.
- Exported measurements or Java run output.
- A report explaining protocol behavior, observed failures, alternative explanations and model limitations.

## Validation

Run `npm run check` at the repository root. JavaScript behavioral tests are in `tests/labs.test.mjs`; Java security checks execute in `Main`.

## Model limitations

Router names represent gateway interfaces. Ethernet frames, ARP and dynamic routing protocols are outside the model.
