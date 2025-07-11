# Fly Swarm App

A distributed swarm intelligence application deployed on Fly.io with comprehensive observability through Langfuse.

## Features

- **Swarm Intelligence**: Simulated multi-agent system with queen coordinator and worker agents
- **Real-time Monitoring**: Health checks and swarm status endpoints
- **Langfuse Integration**: Complete observability for all swarm operations
- **Auto-scaling**: Fly.io managed infrastructure with automatic scaling
- **CI/CD**: GitHub Actions workflow for automated deployment

## Architecture

```
fly-swarm-app/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API endpoints (health, swarm)
│   │   ├── dashboard/    # Swarm monitoring dashboard
│   │   └── agents/       # Agent management UI
│   └── lib/              # Core libraries
│       ├── langfuse.ts   # Langfuse client and middleware
│       └── swarm-tracer.ts # Swarm event tracking
├── .github/workflows/    # CI/CD configuration
├── Dockerfile           # Production container config
└── fly.toml            # Fly.io deployment config
```

## API Endpoints

- `GET /api/health` - Health check with system metrics
- `GET /api/swarm` - Current swarm status and worker states
- `POST /api/swarm` - Send commands to swarm workers

## Langfuse Integration

All API requests and swarm operations are automatically traced to Langfuse for observability:

- API request tracing with latency and error tracking
- Swarm event tracking (consensus, tasks, communication)
- Worker operation monitoring
- Memory operation logging
- Inter-agent communication tracing

## Environment Variables

Set these in Fly.io secrets:

```bash
flyctl secrets set LANGFUSE_PUBLIC_KEY=your_public_key
flyctl secrets set LANGFUSE_SECRET_KEY=your_secret_key
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Type checking
npm run typecheck
```

## Deployment

The application automatically deploys to Fly.io when changes are pushed to the main branch.

Manual deployment:
```bash
flyctl deploy
```

## Monitoring

- **Application**: https://fly-swarm-app.fly.dev
- **Fly.io Dashboard**: https://fly.io/apps/fly-swarm-app
- **Langfuse Dashboard**: View traces at your Langfuse instance

## Swarm Operations

The swarm consists of:
- 1 Queen (strategic coordinator)
- 4 Workers (researcher, coder, analyst, tester)

All operations are traced and can be monitored in real-time through the Langfuse dashboard.