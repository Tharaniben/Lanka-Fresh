# Complaint Relations — Bruno API Tests

Add your module's Bruno request files (.bru) here before opening your PR.

One file per endpoint. Follow the same pattern as product-inventory/categories/.

Make sure to test:
- Happy path (correct data, correct role)
- Wrong role (should get 403)
- Missing required fields (should get 400)
- Resource not found (should get 404)
