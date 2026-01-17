# Why Go over Node.js

I chose Go over Node.js because this platform is fundamentally a concurrency and correctness problem, not just a request–response API. In an event booking system, multiple users compete for the same resources at the same time, and the system must behave predictably under sudden load spikes. Go’s concurrency model lets me reason about these scenarios directly and safely, without relying on complex async abstractions or worrying about blocking a shared event loop. I am tryping to optimize this for predictable performance, explicit control, and operational simplicity, even if it meant slower initial development.

# Why MySQL over PostgreSQL and NoSQL
This event booking platform is read-heavy by nature i.e. browsing events, checking availability, viewing seat maps, and fetching booking history happen far more often than actual ticket purchases. I chose MySQL because it performs extremely well for high-throughput read workloads, has predictable query performance with proper indexing, and offers a very mature replication( to be done :) ) ecosystem for scaling reads horizontally. While PostgreSQL provides powerful write-side and advanced features, this project prioritizes fast, consistent reads and operational simplicity. NoSQL databases were also considered, but the system relies heavily on relational data, transactions, and consistency guarantees, which fit naturally into an SQL model. ACID guarantees for confirmed bookings

| Aspect                       | MySQL       | PostgreSQL  | NoSQL       |
| ---------------------------- | ----------- | ----------- | ----------- |
| Read-heavy performance       |  Excellent  |  Good       |  Good       |
| Write-heavy / complex writes |  Good       |  Excellent  |  Excellent  |
| Relational modeling          |  Strong     |  Strong     |  Limited    |
| Transactions (ACID)          |  Yes        |  Yes        |  Varies     |
| Operational simplicity       |  High       |  Moderate   |  Moderate   |

Why Not PostgreSQL or NoSQL
- PostgreSQL shines in complex write-heavy and advanced analytical workloads, but this system prioritizes fast reads and simpler operational scaling over advanced write-side features.
- NoSQL databases favor write-heavy and eventually consistent workloads(Booking workflows require strong consistency, not eventual consistency), which doesn’t align well with seat availability, booking confirmation, and transactional guarantees required here.

# Why Redis ?
Redis is used in this platform to solve problems that are time-sensitive, concurrency-heavy, and not well suited for a primary database. While MySQL remains the source of truth, Redis acts as a fast, in-memory coordination layer that protects the system during traffic spikes.
In an event booking system, milliseconds matter. Redis provides sub-millisecond access, making it ideal for high-frequency reads without putting unnecessary pressure on the database.

Why Redis fits this project:
- High-traffic reads → cache event listings and availability during spikes
- Low latency → in-memory access keeps booking flows responsive
- TTL-based data → natural fit for temporary holds and expirations
- Database protection → reduces load on MySQL during peak traffic

Why Redis is not the primary database(I had this question before !!):
- Redis is memory-based and not designed for complex relational queries
- Long-term consistency and durability belong in MySQL
- Redis complements the database, it doesn’t replace it.



