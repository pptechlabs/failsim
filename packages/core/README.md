# FailSim Core

Core library for the FailSim API Failure Simulator.

## Installation

```bash
npm install failsim
```

## Quick Start

```typescript
import { FailSim } from 'failsim';

FailSim.init({
  rules: [
    { match: '/api/users', failure: '500', chance: 30 },
  ],
});

// Your fetch calls now simulate failures
const response = await fetch('/api/users');
```

## Documentation

See the [main README](../../README.md) for complete documentation.

## License

MIT