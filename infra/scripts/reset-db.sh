#!/usr/bin/env bash
set -euo pipefail

pnpm db:reset
pnpm db:migrate
pnpm db:seed
