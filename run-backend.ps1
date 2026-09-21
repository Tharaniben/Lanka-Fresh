$env:JAVA_HOME = "$env:USERPROFILE\.jdks\temurin-21.0.12.1"

$env:DB_NAME="lankafresh"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="root"
$env:CLERK_JWKS_URL="https://expert-macaw-9444.clerk.accounts.dev/.well-known/jwks.json"

cd backend
mvn spring-boot:run