# Local runner for the LankaFresh backend (PowerShell).
# Usage:  cd backend ; .\run-local.ps1
# Do NOT commit this file (it contains your password). Add it to .gitignore.

$env:DB_NAME = "lankafresh"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "3279"
$env:CLERK_JWKS_URL = "https://great-krill-80.clerk.accounts.dev/.well-known/jwks.json"

Write-Host "Starting LankaFresh backend (DB: $env:DB_NAME, user: $env:DB_USERNAME)..."
mvn spring-boot:run
