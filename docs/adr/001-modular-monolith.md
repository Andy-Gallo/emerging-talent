# ADR-001: Modular Monolith

Status: accepted

We start with a modular monolith to optimize development velocity, transactional integrity, and local developer ergonomics. Domain boundaries are enforced in code modules and table groups. Service extraction can happen later based on measured load and team needs.
