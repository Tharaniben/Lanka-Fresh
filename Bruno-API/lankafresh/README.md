# LankaFresh — Bruno API Collection

API test collection for the LankaFresh Online project.
Open the `lankafresh/` folder in Bruno to load all requests.

## Setup

1. Install Bruno from https://www.usebruno.com
2. Open Bruno → Open Collection → select the `Bruno-API/lankafresh/` folder from this repo
3. Set up your local environment:
   - In Bruno, click Environments (top right) → Local
   - Set `baseUrl` to `http://localhost:8080/api/v1`
   - Set `token` to your Clerk JWT (see below)

## Getting your Clerk JWT token

1. Open `http://localhost:5173` in your browser and sign in
2. Open DevTools (F12) → Application → Cookies → `localhost`
3. Find the cookie named `__session` — copy its value
4. Paste it as the `token` value in your Bruno local environment

The token expires after ~1 hour. If requests start returning 401, get a fresh token.

## Folder structure

```
lankafresh/
├── product-inventory/    Tharaniben K. — Category, Product, Stock endpoints
├── cart-order/           Gunasekara A.D.S.J. — Cart, Order, Payment endpoints
├── supplier-purchase/    Jayamini K.A.D.D. — Supplier, PurchaseOrder endpoints
├── delivery-management/  Lamahewa D.S. — Delivery, DeliveryAssignment endpoints
├── complaint-relations/  Akarshanee G.H.M. — Complaint, Feedback endpoints
└── sales-reporting/      Kivuldeniya K.H.M.B.D. — Report, Dashboard endpoints
```

## Rules

- Add your module's `.bru` files before opening a PR — no PR without tests
- Never commit the `environments/local.bru` file with a real token in it
- Test happy path + wrong role (403) + missing fields (400) + not found (404)
