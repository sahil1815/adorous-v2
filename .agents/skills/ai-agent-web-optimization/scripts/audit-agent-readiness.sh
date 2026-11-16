#!/usr/bin/env bash
# ==============================================================================
# Agent-Readiness Audit Script for Web Applications & E-Commerce
# Tests any local or live URL against the 16 core AI-Agent readiness standards.
#
# Usage:
#   ./audit-agent-readiness.sh [URL]
#   Example: ./audit-agent-readiness.sh https://adorousfashion.store
#            ./audit-agent-readiness.sh http://localhost:3000
# ==============================================================================

set -u

TARGET_URL="${1:-http://localhost:3000}"
# Strip trailing slash
TARGET_URL="${TARGET_URL%/}"

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
BOLD="\033[1m"
NC="\033[0m"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

TMP_HTML=$(mktemp)
TMP_HEADERS=$(mktemp)
trap 'rm -f "$TMP_HTML" "$TMP_HEADERS"' EXIT

print_header() {
  echo -e "\n${BOLD}${CYAN}================================================================${NC}"
  echo -e "${BOLD}${CYAN}   AI-AGENT READINESS AUDIT FOR: ${TARGET_URL}${NC}"
  echo -e "${BOLD}${CYAN}================================================================${NC}\n"
}

check_result() {
  local num="$1"
  local name="$2"
  local status="$3" # PASS, FAIL, WARN
  local detail="$4"

  if [ "$status" = "PASS" ]; then
    ((PASS_COUNT++))
    echo -e "  [${GREEN}PASS${NC}] ${BOLD}${num}. ${name}${NC}"
    [ -n "$detail" ] && echo -e "         ${GREEN}✓${NC} ${detail}"
  elif [ "$status" = "WARN" ]; then
    ((WARN_COUNT++))
    echo -e "  [${YELLOW}WARN${NC}] ${BOLD}${num}. ${name}${NC}"
    [ -n "$detail" ] && echo -e "         ${YELLOW}!${NC} ${detail}"
  else
    ((FAIL_COUNT++))
    echo -e "  [${RED}FAIL${NC}] ${BOLD}${num}. ${name}${NC}"
    [ -n "$detail" ] && echo -e "         ${RED}✗${NC} ${detail}"
  fi
}

# Fetch Homepage HTML and Headers with standard browser/agent user-agent
curl -sI -L -m 30 -A "Mozilla/5.0 (compatible; AgentReadinessAudit/1.0)" "$TARGET_URL/" 2>/dev/null | tr -d '\r' > "$TMP_HEADERS" || true
curl -s -L -m 35 -A "Mozilla/5.0 (compatible; AgentReadinessAudit/1.0)" "$TARGET_URL/" 2>/dev/null > "$TMP_HTML" || true

print_header

# ------------------------------------------------------------------------------
# 1. Content Signals in robots.txt
# ------------------------------------------------------------------------------
ROBOTS_TXT=$(curl -s -L -m 15 "$TARGET_URL/robots.txt" 2>/dev/null | tr -d '\r' || true)
if echo "$ROBOTS_TXT" | grep -Ei "Content-Signal:" >/dev/null; then
  SIGNAL=$(echo "$ROBOTS_TXT" | grep -Ei "Content-Signal:" | head -n 1)
  check_result "1" "Content Signals declared in robots.txt" "PASS" "Found: $SIGNAL"
else
  check_result "1" "Content Signals declared in robots.txt" "FAIL" "Missing 'Content-Signal: search=yes, ai-train=no' in robots.txt"
fi

# ------------------------------------------------------------------------------
# 2. Real HTTP 404/410 for Missing Pages
# ------------------------------------------------------------------------------
PROBE_PATH="/test-non-existent-agent-check-$(date +%s)"
STATUS_404=$(curl -s -m 15 -o /dev/null -w "%{http_code}" "$TARGET_URL$PROBE_PATH" 2>/dev/null || true)
if [ "$STATUS_404" = "404" ] || [ "$STATUS_404" = "410" ]; then
  check_result "2" "Missing pages return real 404/410" "PASS" "HTTP status: $STATUS_404"
else
  check_result "2" "Missing pages return real 404/410" "FAIL" "Received HTTP $STATUS_404 instead of 404/410 (soft 404 detected)"
fi

# ------------------------------------------------------------------------------
# 3. Clear Heading Hierarchy (Exactly one <h1>)
# ------------------------------------------------------------------------------
H1_COUNT=$(grep -Eio "<h1[^>]*>" "$TMP_HTML" | wc -l | tr -d ' ')
if [ "$H1_COUNT" -eq 1 ]; then
  H1_TEXT=$(sed -n 's/.*<h1[^>]*>\(.*\)<\/h1>.*/\1/p' "$TMP_HTML" | head -n 1 | sed 's/<[^>]*>//g' | xargs)
  check_result "3" "Page has a clear heading hierarchy (single <h1>)" "PASS" "Found 1 <h1>: \"${H1_TEXT:0:60}...\""
elif [ "$H1_COUNT" -eq 0 ]; then
  check_result "3" "Page has a clear heading hierarchy (single <h1>)" "FAIL" "No <h1> tag found on homepage"
else
  check_result "3" "Page has a clear heading hierarchy (single <h1>)" "WARN" "Found multiple ($H1_COUNT) <h1> tags; recommend exactly one"
fi

# ------------------------------------------------------------------------------
# 4. JSON-LD Structured Data Present
# ------------------------------------------------------------------------------
if grep -Ei 'application/ld\+json' "$TMP_HTML" >/dev/null; then
  check_result "4" "JSON-LD structured data is present" "PASS" "Found <script type=\"application/ld+json\"> on homepage"
else
  check_result "4" "JSON-LD structured data is present" "FAIL" "No JSON-LD blocks found in homepage HTML"
fi

# ------------------------------------------------------------------------------
# 5. Organization or LocalBusiness Schema Complete
# ------------------------------------------------------------------------------
if grep -E '"@type"[[:space:]]*:[[:space:]]*(\[[^]]*)?"(Organization|LocalBusiness|Store|JewelryStore)' "$TMP_HTML" >/dev/null; then
  check_result "5" "Organization/LocalBusiness schema is complete" "PASS" "Organization or LocalBusiness entity declared"
else
  check_result "5" "Organization/LocalBusiness schema is complete" "FAIL" "No Organization or LocalBusiness node in structured data"
fi

# ------------------------------------------------------------------------------
# 6. Entity Linked to External Profiles via sameAs
# ------------------------------------------------------------------------------
if grep -Ei '"sameAs"[[:space:]]*:[[:space:]]*\[' "$TMP_HTML" >/dev/null; then
  check_result "6" "Entity is linked via sameAs" "PASS" "Found sameAs social/directory links in structured data"
else
  check_result "6" "Entity is linked via sameAs" "FAIL" "Missing sameAs array in structured data"
fi

# ------------------------------------------------------------------------------
# 7. Multi-Schema Coverage
# ------------------------------------------------------------------------------
SCHEMA_TYPES=$(grep -Eio '"@type"[[:space:]]*:[[:space:]]*"[A-Za-z]+"' "$TMP_HTML" | sort -u | tr -d '"' | sed 's/@type://g' | xargs)
TYPES_COUNT=$(echo "$SCHEMA_TYPES" | wc -w | tr -d ' ')
if [ "$TYPES_COUNT" -ge 3 ]; then
  check_result "7" "Structured data covers multiple schema types" "PASS" "Types declared: $SCHEMA_TYPES"
else
  check_result "7" "Structured data covers multiple schema types" "WARN" "Only $TYPES_COUNT types declared: $SCHEMA_TYPES"
fi

# ------------------------------------------------------------------------------
# 8. About, Contact, and Legal Pages Linked
# ------------------------------------------------------------------------------
HAS_ABOUT=$(grep -Eio 'href="[^"]*(about)[^"]*"' "$TMP_HTML" | head -n 1 || true)
HAS_CONTACT=$(grep -Eio 'href="[^"]*(contact)[^"]*"' "$TMP_HTML" | head -n 1 || true)
HAS_LEGAL=$(grep -Eio 'href="[^"]*(terms|privacy)[^"]*"' "$TMP_HTML" | head -n 1 || true)
if [ -n "$HAS_ABOUT" ] && [ -n "$HAS_CONTACT" ] && [ -n "$HAS_LEGAL" ]; then
  check_result "8" "About, contact, and legal pages are linked" "PASS" "Direct links found for about, contact, and legal pages"
else
  check_result "8" "About, contact, and legal pages are linked" "FAIL" "Missing one or more required links (About: $HAS_ABOUT, Contact: $HAS_CONTACT, Legal: $HAS_LEGAL)"
fi

# ------------------------------------------------------------------------------
# 9. Contact Details Machine-Readable
# ------------------------------------------------------------------------------
HAS_MAILTO=$(grep -Eio 'href="mailto:[^"]+"' "$TMP_HTML" | head -n 1 || true)
HAS_TEL=$(grep -Eio 'href="tel:[^"]+"' "$TMP_HTML" | head -n 1 || true)
if [ -n "$HAS_MAILTO" ] || [ -n "$HAS_TEL" ]; then
  check_result "9" "Contact details are machine-readable" "PASS" "Found: ${HAS_MAILTO:-} ${HAS_TEL:-}"
else
  check_result "9" "Contact details are machine-readable" "FAIL" "No mailto: or tel: links found on homepage"
fi

# ------------------------------------------------------------------------------
# 10. llms.txt is Served as Plain Text
# ------------------------------------------------------------------------------
LLMS_HEADERS=$(curl -sI -L -m 15 "$TARGET_URL/llms.txt" 2>/dev/null | tr -d '\r' || true)
LLMS_STATUS=$(echo "$LLMS_HEADERS" | grep -Ei "^HTTP/" | tail -n 1 | awk '{print $2}')
LLMS_TYPE=$(echo "$LLMS_HEADERS" | grep -Ei "^content-type:" | tail -n 1)
if [ "$LLMS_STATUS" = "200" ] && echo "$LLMS_TYPE" | grep -Ei "text/plain" >/dev/null; then
  check_result "10" "llms.txt is served as plain text" "PASS" "HTTP 200 with text/plain"
else
  check_result "10" "llms.txt is served as plain text" "FAIL" "Status: $LLMS_STATUS, Content-Type: $LLMS_TYPE"
fi

# ------------------------------------------------------------------------------
# 11. llms.txt is Well-Formed
# ------------------------------------------------------------------------------
LLMS_BODY=$(curl -s -L -m 15 "$TARGET_URL/llms.txt" 2>/dev/null | tr -d '\r' || true)
HAS_H1=$(echo "$LLMS_BODY" | grep -E '^# ' | head -n 1 || true)
HAS_QUOTE=$(echo "$LLMS_BODY" | grep -E '^> ' | head -n 1 || true)
HAS_MD_LINKS=$(echo "$LLMS_BODY" | grep -E '^- \[.*\]\(http' | head -n 1 || true)
if [ -n "$HAS_H1" ] && [ -n "$HAS_QUOTE" ] && [ -n "$HAS_MD_LINKS" ]; then
  check_result "11" "llms.txt is well-formed" "PASS" "Includes top-level '# ', blockquote '> ', and markdown link list"
else
  check_result "11" "llms.txt is well-formed" "FAIL" "Format issues: Heading: $HAS_H1, Summary: $HAS_QUOTE, Links: $HAS_MD_LINKS"
fi

# ------------------------------------------------------------------------------
# 12. Serves Markdown when Requested (Accept: text/markdown)
# ------------------------------------------------------------------------------
MD_RESP_HEADERS=$(curl -sI -m 15 -H "Accept: text/markdown" "$TARGET_URL/" 2>/dev/null | tr -d '\r' || true)
MD_STATUS=$(echo "$MD_RESP_HEADERS" | grep -Ei "^HTTP/" | tail -n 1 | awk '{print $2}')
MD_TYPE=$(echo "$MD_RESP_HEADERS" | grep -Ei "^content-type:" | tail -n 1)
if [ "$MD_STATUS" = "200" ] && echo "$MD_TYPE" | grep -Ei "text/markdown" >/dev/null; then
  check_result "12" "Serves Markdown on Accept: text/markdown" "PASS" "Returned Content-Type: text/markdown"
else
  check_result "12" "Serves Markdown on Accept: text/markdown" "FAIL" "Failed content negotiation. Status: $MD_STATUS, Type: $MD_TYPE"
fi

# ------------------------------------------------------------------------------
# 13. Homepage Advertises Resources via Link Headers
# ------------------------------------------------------------------------------
LINK_HEADER=$(grep -Ei "^link:" "$TMP_HEADERS" | head -n 1 || true)
if [ -n "$LINK_HEADER" ] && echo "$LINK_HEADER" | grep -Ei "llms\.txt|alternate" >/dev/null; then
  check_result "13" "Homepage advertises resources via Link headers" "PASS" "$LINK_HEADER"
else
  check_result "13" "Homepage advertises resources via Link headers" "FAIL" "Missing RFC 8288 Link header pointing to llms.txt or markdown alternate"
fi

# ------------------------------------------------------------------------------
# 14. WebMCP Tools Exposed to In-Browser Agents
# ------------------------------------------------------------------------------
HAS_TOOLNAME=$(grep -Eio 'toolname="[^"]+"' "$TMP_HTML" | head -n 1 || true)
HAS_MODEL_CONTEXT=$(grep -Ei "registerTool|modelContext" "$TMP_HTML" || true)
if [ -n "$HAS_TOOLNAME" ] || [ -n "$HAS_MODEL_CONTEXT" ]; then
  check_result "14" "Site exposes WebMCP tools to in-browser agents" "PASS" "Found declarative tool forms or WebMCP provider"
else
  check_result "14" "Site exposes WebMCP tools to in-browser agents" "WARN" "No declarative toolname=\"...\" forms or WebMCP registration found"
fi

# ------------------------------------------------------------------------------
# 15. MCP Server Card Published (SEP-1649)
# ------------------------------------------------------------------------------
CARD_RESP=$(curl -sI -L -m 15 "$TARGET_URL/.well-known/mcp/server-card.json" 2>/dev/null | tr -d '\r' || true)
CARD_STATUS=$(echo "$CARD_RESP" | grep -Ei "^HTTP/" | tail -n 1 | awk '{print $2}')
if [ "$CARD_STATUS" = "200" ]; then
  check_result "15" "MCP Server Card is published (SEP-1649)" "PASS" "Returned HTTP 200 at /.well-known/mcp/server-card.json"
else
  check_result "15" "MCP Server Card is published (SEP-1649)" "FAIL" "Status '$CARD_STATUS' at /.well-known/mcp/server-card.json"
fi

# ------------------------------------------------------------------------------
# 16. Prices Reachable Without JavaScript or Login
# ------------------------------------------------------------------------------
HAS_OFFER_SCHEMA=$(grep -Ei '"@type"[[:space:]]*:[[:space:]]*"Offer"' "$TMP_HTML" || true)
HAS_PRICE_PROP=$(grep -Ei 'itemprop="price"' "$TMP_HTML" || true)
HAS_PRICING_LINK=$(grep -Eio 'href="[^"]*pricing[^"]*"' "$TMP_HTML" | head -n 1 || true)
if [ -n "$HAS_OFFER_SCHEMA" ] || [ -n "$HAS_PRICE_PROP" ] || [ -n "$HAS_PRICING_LINK" ]; then
  check_result "16" "Prices reachable without JavaScript or login" "PASS" "Offer schema, price microdata, or /pricing page found in SSR HTML"
else
  check_result "16" "Prices reachable without JavaScript or login" "FAIL" "No prices, Offer schema, or /pricing link in SSR HTML"
fi

# ------------------------------------------------------------------------------
# Summary Report
# ------------------------------------------------------------------------------
TOTAL=$((PASS_COUNT + FAIL_COUNT + WARN_COUNT))
echo -e "\n${BOLD}${CYAN}----------------------------------------------------------------${NC}"
echo -e "${BOLD}AUDIT SUMMARY:${NC} ${GREEN}${PASS_COUNT} Passed${NC} | ${YELLOW}${WARN_COUNT} Warnings${NC} | ${RED}${FAIL_COUNT} Failed${NC} (Total: ${TOTAL})"
echo -e "${BOLD}${CYAN}----------------------------------------------------------------${NC}\n"

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✓ SITE IS 100% READY FOR AI AGENTS!${NC}\n"
  exit 0
else
  echo -e "${RED}${BOLD}✗ REMEDIATION REQUIRED FOR ${FAIL_COUNT} ITEM(S).${NC}\n"
  exit 1
fi
