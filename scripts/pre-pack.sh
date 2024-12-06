#!/bin/sh

# Run the Prettier check
pnpm prettier:check &&

# Run linting
pnpm lint  &&

# Run TypeScript type check
pnpm ts:check &&

# Run tests with coverage
pnpm test:cov &&

# Run the clean build
pnpm build:clean
