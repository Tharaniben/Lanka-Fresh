# Sales & Business Reporting

Package: `com.lankafresh.backend.salesreporting`

Structure:
- `model/` — JPA entity classes (@Entity)
- `repository/` — Spring Data JPA repository interfaces
- `service/` — business logic
- `controller/` — REST endpoints (@RestController, base path /api/...)

Keep this module in these four packages. Shared code (used by more than one
module) belongs in `com.lankafresh.backend.config` or a new shared package —
ask before adding one so we do not duplicate effort.
