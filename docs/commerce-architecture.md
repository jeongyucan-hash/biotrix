# BIOTRIX Commerce Architecture

## Public
- `/` brand + commerce entry
- `/shop` product discovery
- `/product/[slug]` product detail
- `/cart` cart
- `/checkout` checkout
- `/account` login / order history / delivery status

## Admin
Target hostname: `admin.biotrix.co.kr`

Admin modules:
1. Dashboard
2. Products
3. Orders
4. Customers
5. Inventory
6. CS / inquiries
7. Suppliers
8. Margin / profitability
9. Content / promotions
10. Analytics

Admin must never rely on URL secrecy. Production requires authentication, server-side authorization, role checks, audit logging, and protection of service-role credentials.

## Recommended data model

### products
- id
- slug
- name
- category: fresh | wellness | beauty
- brand
- description
- status: draft | active | archived
- origin_country
- manufacturer
- supplier_id
- created_at / updated_at

### product_variants
- id
- product_id
- sku
- option_name
- retail_price
- compare_at_price
- purchase_cost
- tax_type
- weight
- active

### inventory
- variant_id
- on_hand
- reserved
- available
- safety_stock
- updated_at

### customers
- id
- auth_user_id
- name
- email
- phone
- marketing_consent
- created_at

### addresses
- id
- customer_id
- recipient
- phone
- postal_code
- address1
- address2
- is_default

### orders
- id
- order_number
- customer_id
- status
- payment_status
- fulfillment_status
- subtotal
- shipping_fee
- discount
- total
- payment_provider
- payment_key
- created_at

### order_items
- order_id
- variant_id
- product_name_snapshot
- option_snapshot
- quantity
- unit_price
- purchase_cost_snapshot

### suppliers
- id
- name
- business_number
- contact_name
- phone
- email
- settlement_terms

### inquiries
- id
- customer_id
- order_id
- type
- subject
- content
- status
- assigned_admin
- created_at

### admin_users / admin_roles
- auth_user_id
- role: owner | manager | cs | logistics | analyst
- active
- last_login_at

### audit_logs
- admin_user_id
- action
- entity
- entity_id
- before_json
- after_json
- created_at

## Profitability
Order-line contribution margin should be derivable from:
- revenue
- purchase cost snapshot
- payment fee
- marketplace / channel fee
- shipping subsidy
- discount / coupon burden
- ad attribution cost (later)

## Security
- Row Level Security where supported
- service-role key server-only
- admin authorization checked server-side
- payment amount revalidated server-side
- webhook signatures verified
- order and payment operations idempotent
- PII access minimized and audited

## Deployment
- Production: main branch
- Preview: commerce-nextjs branch
- Vercel handles preview deployments
- Production promotion only after auth, DB and checkout testing
