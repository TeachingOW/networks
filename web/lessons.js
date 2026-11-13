export const lessons = {
 detective: {
  goal: 'Use RTT and loss as evidence; distinguish an observation from a possible cause.',
  problem: 'A student says: “My connection is slow, so the Wi-Fi must be broken.” Can these measurements justify that conclusion?',
  steps: ['Run the healthy scenario and save it as your baseline.', 'Predict how congestion will affect RTT. Change only the scenario to congestion and run again.', 'Compare loss and jitter scenarios. Identify evidence that separates them, and evidence that remains ambiguous.'],
  question: 'Which extra measurement would help distinguish a busy link from weak wireless reception?',
  rubric: 'Cite RTT and loss from two runs. Explain why a symptom alone does not identify a physical cause.',
  limit: 'These are generated samples, not measurements of your connection.'
 },
 internet: {
  goal: 'Explain longest-prefix routing and why ping needs both a forward and a return path.',
  problem: 'Alice can send a request toward the server. Does that prove she can receive its reply?',
  steps: ['Run the default topology and save the delivered result as your baseline.', 'In the topology JSON, remove the r1–r3 link. Predict the result, then run.', 'Inspect the routing tables and change the route through r2. Check the return route and run again.'],
  question: 'Where does the failed packet stop, and which route or link would repair it?',
  rubric: 'Record the failed path and the repaired forward and return paths. Explain the next-hop decision.',
  limit: 'This model uses static routing; it does not implement a dynamic routing protocol.'
 },
 video: {
  goal: 'Explain the tradeoff between playback delay, late frames and selected bitrate.',
  problem: 'You are designing a video tutoring call on a poor connection. Should you increase the buffer or lower the bitrate?',
  steps: ['Set bandwidth to 1 Mbps, delay to 200 ms, loss to 5%, and turn adaptation off. Run and save a baseline.', 'Predict the effect of adaptation, enable it, and run with all other settings unchanged.', 'Save a new baseline. Increase only the jitter buffer and compare late frames against the added playback delay.'],
  question: 'Which change would you choose for a conversation, and what cost would you accept?',
  rubric: 'Compare frames played, late frames and bitrate. Explain why a larger buffer cannot recover a lost packet.',
  limit: 'Frames are simulated datagrams; this is not a real WebRTC call.'
 },
 admin: {
  goal: 'Separate observed protocol failures from inferred causes and evaluate a small classifier.',
  problem: 'A log shows a TLS connection reset. Can an automated report conclude that the certificate is invalid?',
  steps: ['Run the sample incidents and inspect the technical report. Save a baseline.', 'Change one observed stage to unknown, predict what evidence is lost, and run again.', 'Create a new labeled incident. Compare its rule-based diagnosis and classifier prediction with the label you supplied.'],
  question: 'What diagnostic test would you run before acting on the predicted cause?',
  rubric: 'Quote the observed stage, the inferred cause and a follow-up test. Explain why two labeled examples cannot establish real-world accuracy.',
  limit: 'The classifier is trained on synthetic examples; its predictions are not proof of a root cause.'
 },
 vpn: {
  goal: 'Distinguish confidentiality, integrity and replay protection using executable Java checks.',
  problem: 'An attacker cannot read an encrypted packet. Could forwarding the same packet twice still cause harm?',
  steps: ['Download all four Java source files using the links below and place them in one folder.', 'Run javac *.java, then java Main in that folder with JDK 17 or later.', 'Match the tampering and replay checks to the security property each protects. Explain why valid reordering is accepted.'],
  question: 'Why does authenticated encryption still need a replay window?',
  rubric: 'Include your actual Java output and explain one integrity check and one replay check. Browser configuration values are not execution evidence.',
  limit: 'This Java tunnel does not configure OS routing or implement key exchange.'
 },
 game: {
  goal: 'Explain responsiveness, prediction error and reconciliation under delay and loss.',
  problem: 'A player wants immediate controls, but the server decides the true position. What happens when those views disagree?',
  steps: ['Use UDP, 150 ms delay and 5% loss. Disable prediction, run and save a baseline.', 'Predict the effect on position error, enable prediction and run again.', 'Keep prediction fixed and compare UDP with TCP. Inspect the two position traces and explain their differences.'],
  question: 'Does smaller position error always mean controls feel more responsive?',
  rubric: 'Use the measured error and trace behavior. Distinguish immediate local feedback from agreement with the server.',
  limit: 'These are simplified transport models, not actual multiplayer sockets.'
 },
 cdn: {
  goal: 'Explain how cache capacity, eviction and routing affect response time and origin traffic.',
  problem: 'Your course site repeatedly serves popular files. Which cache configuration would reduce origin requests?',
  steps: ['Choose latency routing, LRU and capacity 1. Run and save a baseline.', 'Predict the effect of capacity 8, change only capacity and run again.', 'Fix capacity at 3 and compare LRU with FIFO. Then inspect all routing comparisons in the technical report.'],
  question: 'Why might the best hit ratio and the fastest response time come from different configurations?',
  rubric: 'Cite hit ratio, response time and origin requests. Explain the effects of locality and queueing.',
  limit: 'Cache fills are atomic; the model omits simultaneous miss coalescing and asynchronous fills.'
 }
};
