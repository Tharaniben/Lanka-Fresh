# LankaFresh Online

SE2030 Group Project (B7G1-03) — an online grocery store platform.

## Tech stack

| Layer    | Technology                                   |
|----------|-----------------------------------------------|
| Backend  | Java 21, Spring Boot 3.5.16, Maven, MySQL     |
| Frontend | React 19, Vite, React Router, Axios           |
| Auth     | Clerk                                         |

## Project structure

```
lankafresh/
├── backend/    Spring Boot REST API
│   └── src/main/java/com/lankafresh/backend/
│       ├── config/              shared configuration (CORS, etc.)
│       ├── productinventory/    Product & Inventory Management
│       ├── cartorder/           Shopping Cart & Order Management
│       ├── supplierpurchase/    Supplier & Purchase Order Management
│       ├── deliverymanagement/  Delivery Management
│       ├── complaintrelations/  Complaint & Customer Relations Management
│       └── salesreporting/      Sales & Business Reporting
└── frontend/   React (Vite) SPA
    └── src/
        ├── components/   shared UI (navbar, buttons, layout)
        ├── services/     shared API client (api.js)
        ├── pages/         top-level pages (home, etc.)
        └── features/
            ├── product-inventory/
            ├── cart-order/
            ├── supplier-purchase/
            ├── delivery-management/
            ├── complaint-relations/
            └── sales-reporting/
```

Each module folder has its own `README.md` describing its scope. Work inside
your own module folder; shared/common code goes in `components/` or
`services/` (frontend) or `config/` (backend) — check with the team before
adding new shared code so we don't duplicate each other's work.

## Running the backend

Requires: JDK 21, Maven, a running MySQL server.

If you're using IntelliJ IDEA (recommended — it bundles Maven and JDK
management), just open the `backend/` folder and run
`LankafreshBackendApplication.java` directly; IntelliJ handles the Maven
build for you. From a terminal instead:

```bash
cd backend

# Set your local DB credentials (don't commit real credentials anywhere)
export DB_NAME=lankafresh
export DB_USERNAME=root
export DB_PASSWORD=yourpassword

mvn spring-boot:run
```

The API will start on `http://localhost:8080`.

## Running the frontend

Requires: Node.js 20+.

```bash
cd frontend
npm install
npm run dev
```

The app will start on `http://localhost:5173` and is already configured to
call the backend at `http://localhost:8080/api`.

## Branching & workflow

See `CONTRIBUTING.md` for the branching strategy and pull request process.
