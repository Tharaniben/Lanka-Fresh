# Contributing to LankaFresh

## Branch structure

- `main` — the integration branch. Once everyone has their own branch, avoid
  pushing directly to `main` except for genuinely shared setup changes the
  team has agreed on. Everything else lands here via Pull Request.
- One branch per member, matching their module:
  - `feature/product-inventory`
  - `feature/cart-order`
  - `feature/supplier-purchase`
  - `feature/delivery-management`
  - `feature/complaint-relations`
  - `feature/sales-reporting`

## Day-to-day workflow

1. Work on your own `feature/<your-module>` branch — not `main`.
2. Commit often, with descriptive messages (see convention below).
3. Before starting a session, sync with `main` so you're not building on
   stale code:
   ```bash
   git checkout feature/your-module
   git pull origin main
   ```
4. When a chunk of work is ready, push your branch and open a Pull Request
   into `main` on GitHub. Ask a teammate to skim it before merging — this
   catches mistakes early and gives you both a paper trail for the
   individual-contribution part of the report.
5. Merge via GitHub's "Merge pull request" button rather than pushing
   directly to `main`, so there's a clean record of each module's history.

## Avoiding merge conflicts

- Stay inside your own module folder:
  - Backend: `backend/src/main/java/com/lankafresh/backend/<your-module>/`
  - Frontend: `frontend/src/features/<your-module>/`
- Shared files — `pom.xml`, `frontend/package.json`, anything in `config/`,
  `components/`, or `services/` — are the most common source of conflicts
  because everyone touches them. Message the team before editing one of
  these so two people aren't changing it at once, and pull the latest
  `main` first.
- Pull `main` into your branch regularly. Don't let your branch drift for
  weeks and then merge everything at once — small, frequent merges are far
  easier to resolve than one giant one at the deadline.

## Commit message convention (recommended, not enforced)

`type(module): short description`

Examples:
- `feat(product-inventory): add low stock alert`
- `fix(cart-order): correct total price calculation`
- `docs(delivery-management): add module README`

Not required for grading, but it makes it much easier to explain "who did
what, and when" during the viva.
