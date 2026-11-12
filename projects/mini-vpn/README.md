# Build a Mini VPN

## Objective

Compile the four source files and run Main. Use independent directional session keys, authenticated headers and replay protection.

## Prerequisites and required skills

Java 17 records, byte arrays, exceptions, symmetric keys, authenticated encryption.

## Setup and run

From the repository root: `npm run test:java`. Browser projects require Node 18+ for local serving; Java requires JDK 17+. No npm packages are needed.

## Implementation

See `src/Main.java`, `src/Packet.java`, `src/VPNClient.java` and `src/VPNNetwork.java`.

## Required experiments

Run npm run test:java. Demonstrate ciphertext/header/nonce modification, duplicates, wrong keys, reordering and stale packets.

## Deliverables

- Working source and a reproducible demonstration.
- Exported measurements or Java run output.
- A report explaining protocol behavior, observed failures, alternative explanations and model limitations.

## Validation

Run `npm run check` at the repository root. JavaScript behavioral tests are in `tests/labs.test.mjs`; Java security checks execute in `Main`.

## Model limitations

Educational in-memory tunnel. No operating-system VPN, real sockets, identity protocol or key exchange. Never reuse session keys after restarting counters.
