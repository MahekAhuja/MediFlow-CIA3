# MediFlow — CIA 3 Project Source

This repository contains a plain HTML/CSS/JavaScript demonstration frontend and a Java 17 / Spring Boot API implementing the two algorithms selected for the Advanced Algorithm CIA 3 brief.

## Project structure

- `frontend/` — portal-selection demo UI, entity-specific navigation, sample dashboard tables, request form, and algorithm UI calling the Java API.
- `backend/` — Spring Boot REST API, Edmonds–Karp, Randomized Quickselect, JUnit tests, sample inputs.

## Important scope and honesty note

The frontend portal selector is a local demonstration, not secure authentication. The sample records are synthetic. No database, multi-user authentication, production authorization, or real map provider is included. The map panel is illustrative. Do not describe these as production capabilities.

## Run the Java backend

Requirements: JDK 17+ and Maven 3.9+.

```bash
cd backend
mvn clean test
mvn spring-boot:run
```

The API starts at `http://localhost:8080`.

Health check: `GET http://localhost:8080/api/health`

### Edmonds–Karp

`POST http://localhost:8080/api/algorithms/max-flow`

```json
{
  "nodes": ["Warehouse A", "Hub", "Hospital A"],
  "source": "Warehouse A",
  "sink": "Hospital A",
  "edges": [
    {"from":"Warehouse A","to":"Hub","capacity":20},
    {"from":"Hub","to":"Hospital A","capacity":12},
    {"from":"Warehouse A","to":"Hospital A","capacity":5}
  ]
}
```

### Randomized Quickselect

`POST http://localhost:8080/api/algorithms/demand-percentile`

```json
{"demands":[12,18,20,24,30,16,45,22,19,27],"percentile":90,"seed":2026}
```

The implementation uses nearest-rank percentile: `rank = ceil(p*n/100)`, and selects the zero-based element at `rank - 1`. A seed makes the randomized pivot sequence reproducible.

## Run the frontend

Open `frontend/index.html` in a browser. For best results, serve it locally (for example with VS Code Live Server). Start the backend separately before using the Analytics page. The frontend sends requests to `http://localhost:8080`.

## Algorithms and complexity

- Edmonds–Karp: BFS augmenting paths on a residual graph; `O(V * E^2)` time. It computes maximum flow for a directed capacitated network.
- Randomized Quickselect: random pivot partition; expected `O(n)` time, worst-case `O(n^2)`; defensive copy requires `O(n)` auxiliary memory in this implementation.

## Testing and evidence

Run `mvn clean test`. Tests cover ordinary, duplicate, boundary, disconnected and invalid-input cases. For the submission evidence, add a benchmark runner with three input sizes and record actual timings from the team's computers. Do not invent benchmark numbers; JVM warm-up and machine conditions affect results.

## Suggested team contribution workflow

Use branches and commits for real work only. Each student should make changes they personally implement, review or test, then commit under their own Git identity. Do not fabricate commit history or attribute code to someone who did not create or materially review it.
