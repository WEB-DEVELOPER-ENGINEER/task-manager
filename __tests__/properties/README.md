# Property-Based Tests

This directory contains property-based tests using fast-check.

Property tests verify:

- Universal properties that should hold across all inputs
- Correctness properties from the design document
- Invariants and round-trip properties

Each test should:

- Run at least 100 iterations
- Reference the corresponding design document property
- Use the format: `// **Feature: task-manager-app, Property {number}: {property_text}**`
