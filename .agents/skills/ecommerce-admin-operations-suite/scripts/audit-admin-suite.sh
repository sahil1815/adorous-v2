#!/usr/bin/env bash
# audit-admin-suite.sh
# Verifies that an implementation of the E-Commerce Admin Operations Suite has all required
# routes, components, and zero missing dependencies.

set -euo pipefail

echo "==> Auditing E-Commerce Admin Operations Suite..."

REQUIRED_ROUTES=(
  "src/app/admin/layout.tsx"
  "src/app/admin/page.tsx"
  "src/app/admin/inventory/page.tsx"
  "src/app/admin/inventory/new/page.tsx"
  "src/app/admin/product-ordering/page.tsx"
  "src/app/admin/analytics/page.tsx"
  "src/app/admin/coupons/page.tsx"
  "src/app/admin/reviews/page.tsx"
  "src/app/admin/whatsapp/page.tsx"
)

REQUIRED_COMPONENTS=(
  "src/components/admin/adminNavConfig.ts"
  "src/components/admin/AdminSidebar.tsx"
  "src/components/admin/AdminHeader.tsx"
  "src/components/admin/AdminQuickSearchModal.tsx"
  "src/components/admin/orders/OrderCard.tsx"
  "src/components/admin/orders/OrderStatsHeader.tsx"
  "src/components/admin/inventory/InventoryProductCard.tsx"
)

MISSING=0

echo "--> Checking Required Admin Routes..."
for route in "${REQUIRED_ROUTES[@]}"; do
  if [ -f "$route" ]; then
    echo "  [OK] $route"
  else
    echo "  [FAIL] Missing route: $route"
    MISSING=$((MISSING + 1))
  fi
done

echo "--> Checking Required Modular Components..."
for comp in "${REQUIRED_COMPONENTS[@]}"; do
  if [ -f "$comp" ]; then
    echo "  [OK] $comp"
  else
    echo "  [FAIL] Missing component: $comp"
    MISSING=$((MISSING + 1))
  fi
done

if [ "$MISSING" -gt 0 ]; then
  echo "==> Audit failed: $MISSING required files are missing."
  exit 1
else
  echo "==> Audit passed! All core admin suite routes and components exist."
fi
