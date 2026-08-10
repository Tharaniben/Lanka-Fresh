# Product & Inventory Management (Frontend)

Owner: Product & Inventory module

Scope:
- Product catalog (add / edit / delete / view products)
- Stock level tracking and low-stock alerts
- Expiry date tracking
- Product categorisation
- Inventory reports

All components, pages, and API calls for this module live in this folder.
Module-specific types (e.g. `Product`) go in a `types.ts` file here — only
promote a type to `src/types/` if another module genuinely needs it too.
Shared UI belongs in `src/components/`; shared HTTP setup lives in
`src/services/api.ts`.
