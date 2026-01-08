# Event Booking Platform
What I’m building

This project is a real-world event booking backend.
It’s the kind of system you’d expect behind platforms where:
users discover events,
organizers create and manage them,
seats are booked safely (without overbooking),
tickets are generated as PDFs,
and everything doesn’t fall apart under load.

I’m building this to learn backend engineering properly concurrency, caching, async processing, cloud storage, auth, and failure handling i.e. the stuff that actually matters.

This is not about “just making it work”.
It’s about making it correct, scalable, and debuggable.

I wanted a project where I could:
- deal with race conditions ( apply both optimistic & pessimistic locking)
- use transactions and row-level locks
-introduce Redis caching with versioning
- use NATS for async jobs (PDF + notifications)
- integrate AWS S3 + CloudFront

# Stack used 
- React + Tailwind 
- React Router
- TanStack Query
- Gin (GoLang)
- Redis (Memory DB)
- NATS (Message Queue)
- S3 & CloudFront (AWS)
- MySql (Disk DB)
- GoPDF (pdf generation)

<img width="1470" height="956" alt="screenshort" src="https://github.com/user-attachments/assets/d74d4fc4-38a7-4736-91cf-a9074881ffad" />
