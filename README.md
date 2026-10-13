# QuickNotes System Design

## Description

QuickNotes is a full-stack system design portfolio project. It serves as both a functional frontend prototype and a comprehensive backend architecture blueprint. The project demonstrates how to scale a web application from a single monolithic server to a distributed system capable of handling 1 million users, featuring read replicas, caching, and message queues.

## How to Run the API Client

The frontend prototype is built with vanilla HTML, CSS, and JavaScript. It communicates with the JSONPlaceholder mock API.

1. Clone this repository to your local machine.
2. Open the `index.html` file directly in any modern web browser (no local development server is required).
3. Use the interface to load, create, and delete notes.

## System Design Documents

The blueprints for the production-grade QuickNotes backend are located in the `docs/` folder:

- [API Design Document](docs/api-design.md): RESTful endpoint definitions, JSON payloads, and HTTP status codes.
- [Data Model Document](docs/data-model.md): SQL schema, relationships, indexes, and database justification.
- [Architecture Document](docs/architecture.md): Scalability estimates, component diagrams, request flows, and trade-offs.

## What I Learned

Throughout the development of this project, I learned:

1. **Frontend Security:** How to safely render dynamic data in the DOM using `textContent` to prevent Cross-Site Scripting (XSS) attacks.
2. **RESTful Conventions:** How to design predictable API endpoints and handle edge cases (like simulated deletions for mock APIs) gracefully.
3. **Relational Database Modeling:** How to structure complex many-to-many relationships in SQL using junction tables, and how to optimize read-heavy tables with indexes.
4. **Cloud Architecture:** How to map out distributed systems using Load Balancers, Redis caches, CDN edge servers, and asynchronous message queues to eliminate single points of failure.
