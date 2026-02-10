# Patient Outreach and Appointment Reminder Platform

A comprehensive platform for managing patient outreach and automated appointment reminders. This full-stack application utilizes a modern tech stack to ensure reliability, scalability, and ease of use.

## Features

- **Patient Management**: Manage patient records and contact information.
- **Appointment Reminders**: Automated reminders via various channels.
- **Analytics & Monitoring**: Real-time monitoring with Prometheus and Grafana.
- **Scalable Infrastructure**: Containerized with Docker and orchestrated with Docker Compose.

## Tech Stack

### Frontend
- **React**: UI library for building interactive interfaces.
- **Vite**: Next Generation Frontend Tooling.
- **Tailwind CSS**: Utility-first CSS framework.
- **TypeScript**: Static type definitions.

### Backend
- **Node.js & Express**: Fast, unopinionated, minimalist web framework.
- **TypeScript**: Static type definitions.
- **Prisma**: Next-generation ORM for Node.js and TypeScript.
- **BullMQ**: Message queue based on Redis.
- **Winston**: Logger for just about everything.

### Database & Infrastructure
- **PostgreSQL**: Advanced open source relational database.
- **Redis**: In-memory data structure store, used as a database, cache, and message broker.
- **Docker & Docker Compose**: Containerization and orchestration.
- **Terraform**: Infrastructure as Code (IaC).
- **Prometheus & Grafana**: Monitoring and observability.

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd patient-outreach-platform
```

### 2. Install Dependencies

Install dependencies for both client and server:

```bash
npm install
```

### 3. Environment Setup

Ensure you have the necessary environment variables set up. Check `.env.example` if available, or refer to `docker-compose.yml` for required variables.

### 4. Running the Application

You can run the application using Docker Compose for a complete environment setup:

```bash
docker-compose up --build
```

Access the services at:
- **Client**: http://localhost:80
- **Server**: http://localhost:3000
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090

### 5. Development Mode

To run the client and server individually in development mode:

**Server:**
```bash
npm run dev:server
```

**Client:**
```bash
npm run dev:client
```

## Project Structure

- `client/`: React frontend application.
- `server/`: Express backend application.
- `shared/`: Shared code between client and server.
- `terraform/`: Infrastructure validation and setup.
- `docker-compose.yml`: Docker services configuration.

## License

[ISC](LICENSE)
