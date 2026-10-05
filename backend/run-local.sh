#!/bin/bash
# Local runner for the LankaFresh backend.
# Sets the environment variables that application.properties reads,
# so application.properties itself does not need to be changed.
#
# Usage (Git Bash):  cd backend && bash run-local.sh
# Do NOT commit this file (it contains your password). Add it to .gitignore.

export DB_NAME="lankafresh"
export DB_USERNAME="root"
export DB_PASSWORD="3279"
export CLERK_JWKS_URL="https://great-krill-80.clerk.accounts.dev/.well-known/jwks.json"

echo "Starting LankaFresh backend (DB: $DB_NAME, user: $DB_USERNAME)..."
mvn spring-boot:run
