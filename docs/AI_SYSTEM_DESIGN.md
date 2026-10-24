# GoNest AI System Design

## Principle
AI assists users and operators; it does not become the source of truth. Database queries, authorization, prices, listing status, and external actions remain deterministic.

## First AI capability
Natural-language rental search can be added after the structured search and data-quality rules are reliable:
1. Parse user text into a strict schema (location, budget/currency, bedrooms, purpose, property type, amenities).
2. Validate and normalize each field.
3. Ask a clarification question for ambiguous hard constraints.
4. Build filters with existing typed application code; never execute model-generated SQL.
5. Retrieve actual records from Supabase under normal access controls.
6. Explain matches using stored fields and label missing data.
7. Log evaluation metadata without unnecessary personal data.

## Other candidate services
Listing-description drafting from owner-provided facts; missing-field detection; duplicate/suspicious listing triage; authorized-document extraction with source spans and human review; enquiry summarization for agents.

## Tool permissions
Begin with no autonomous write tools. If workflow tools are later added, specify allowed operations, role checks, confirmation requirements, idempotency keys, timeouts, retry limits, audit events and human escalation.

## Threat model
Treat listing descriptions, uploaded files, retrieved pages, and user messages as untrusted data. Prompt injection must not change system instructions or grant tools. Validate output with schemas and policy checks. Do not pass service-role credentials to a model or browser.

## Evaluation
Maintain a versioned dataset for filter extraction, currency/budget edge cases, ambiguous locations, missing/contradictory facts, prompt injection, fairness, permission denials, latency and cost. Release only when regression tests pass.
