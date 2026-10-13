# QuickNotes System Architecture

This document outlines the system architecture required to scale QuickNotes to support 1 million users.

## 1. Requirements

### Functional Requirements

- Users can create, view, and delete text-based notes.
- Users can retrieve a list of their previously saved notes.
- The system performs background processing (e.g., generating export PDFs or sending welcome emails).

### Non-Functional Requirements

- **High Availability:** The system must remain online even if individual servers fail.
- **Low Latency:** Note retrieval (`GET` requests) should take less than 200ms.
- **Scalability:** The architecture must effortlessly support 1 million registered users.

## 2. Load Estimates (1 Million Users)

**Assumptions:** 1,000,000 registered users, 10% Daily Active Users (100,000 DAU). Seconds in a day rounded to 100,000 for estimation. Each active user writes 5 notes/day and views their notes 50 times/day. Average note size is 1 KB.

- **Writes per second (`POST`):**
  - 100,000 DAU × 5 notes = 500,000 writes/day.
  - 500,000 ÷ 100,000 seconds = **5 writes/second**.
- **Reads per second (`GET`):**
  - 100,000 DAU × 50 views = 5,000,000 reads/day.
  - 5,000,000 ÷ 100,000 seconds = **50 reads/second**.
- **Storage per year:**
  - 500,000 notes/day × 1 KB = 500 MB/day.
  - 500 MB × 365 days = **~182.5 GB per year**.

## 3. Architecture Diagram

```text
                         ┌─────────┐
          ┌─────────────>│   DNS   │
          │              └─────────┘
    ┌─────┴─────┐      ┌──────────────────────┐
    │  Browser  │─────>│ CDN (HTML, CSS, JS)  │
    │  Client   │      └──────────────────────┘
    └─────┬─────┘
          │ API JSON calls (HTTPS)
          v
    ┌───────────────┐
    │ Load Balancer │
    └──────┬────────┘
           │
      ┌────┴────┬─────────┐
      v         v         v
  ┌───────┐ ┌───────┐ ┌───────┐      ┌──────────────┐
  │ App 1 │ │ App 2 │ │ App 3 │─────>│ Cache (Redis)│
  └───┬───┘ └───┬───┘ └───┬───┘      └──────────────┘
      │         │         │
      │ writes  │ reads   │ jobs
      v         v         v
  ┌─────────┐ ┌─────────┐ ┌───────┐   ┌─────────┐
  │ Primary │ │ Read    │ │ Queue │──>│ Worker  │
  │   DB    │>│ Replica │ └───────┘   └─────────┘
  └─────────┘ └─────────┘
```

## 4. Component Explanations

- **Client:** The user's browser running the HTML, CSS, and Vanilla JavaScript frontend.
- **DNS:** Translates the domain name (e.g., quicknotes.com) into the IP address of our Load Balancer or CDN.
- **CDN (Content Delivery Network):** Caches static assets (HTML, CSS, JS) on global edge servers to reduce latency for users loading the initial page.
- **Load Balancer:** Distributes incoming API requests across multiple healthy application servers to prevent any single server from becoming overwhelmed.
- **App Servers (Stateless):** Run the core API logic (validation, DB queries) without storing local user data, allowing infinite horizontal scaling.
- **Cache (Redis):** Stores frequently accessed data (like a user's note list) in ultra-fast RAM to dramatically reduce read times and database load.
- **Primary Database:** The single source of truth that handles all write (`INSERT`, `UPDATE`, `DELETE`) operations to ensure strict data consistency.
- **Read Replica:** Maintains a near-real-time copy of the primary database to handle the heavy read (`SELECT`) traffic.
- **Queue & Worker:** The queue temporarily holds slow background tasks (like PDF exports), allowing the worker server to process them asynchronously so the App Servers stay fast and responsive.

## 5. Request Flows

### Loading Notes (`GET /notes`)

1. The Load Balancer routes the request to App Server 1.
2. App Server 1 checks the **Redis Cache** for `notes:user:123`.
3. If found (Cache Hit), it returns the data immediately.
4. If not found (Cache Miss), App Server 1 queries the **Read Replica**, saves the result in Redis with a TTL, and returns the response to the user.

### Creating a Note (`POST /notes`)

1. The Load Balancer routes the request to App Server 2.
2. App Server 2 validates the payload and executes an `INSERT` statement directly on the **Primary Database**.
3. App Server 2 immediately deletes `notes:user:123` from the **Redis Cache** (Invalidation) to ensure the next `GET` request fetches fresh data.
4. App Server 2 drops an "analyze text" job into the **Queue** for the worker.
5. App Server 2 returns a `201 Created` response to the user.

## 6. Trade-offs

1. **Speed vs. Freshness (Caching):** By utilizing a Redis cache, we achieve lightning-fast `< 10ms` response times for `GET /notes`. The trade-off is the risk of serving briefly stale data if a cache invalidation fails during a write operation.
2. **Scalability vs. Complexity (Database Replication):** Implementing a Primary/Replica database architecture safely handles our 50 reads/second load. However, this introduces complexity via eventual consistency (replication lag), where a read replica might briefly lack the latest write.

## 7. Avoiding Single Points of Failure (SPOF)

This architecture eliminates single points of failure at every tier. The Load Balancer acts as a health monitor; if App Server 1 crashes, traffic is instantly rerouted to App Servers 2 and 3. Furthermore, if the Primary Database goes offline, the Read Replica can be promoted to become the new Primary, ensuring the system remains operational.
