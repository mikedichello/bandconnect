#!/usr/bin/env bash
# One-time setup for a GitHub Codespaces / dev-container demo of BandConnect.
# No Vercel, no Postgres, no keys — just seeded SQLite, fully functional.
set -e

# Use the Codespace's public forwarded URL for auth/links when available,
# otherwise fall back to localhost (works in a local VS Code dev container).
BASE="http://localhost:3000"
if [ -n "$CODESPACE_NAME" ] && [ -n "$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN" ]; then
  BASE="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
fi

cat > .env <<EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="codespace-demo-secret-not-for-production"
NEXTAUTH_URL="$BASE"
NEXT_PUBLIC_APP_URL="$BASE"
NEXT_PUBLIC_DEMO="1"
EOF

export DATABASE_URL="file:./dev.db"

npm install
npm run db:push    # create the SQLite tables
npm run db:seed    # load the Connecticut demo data

echo ""
echo "✅ BandConnect demo is ready."
echo "   Start it:  npm run dev"
echo "   Then open the forwarded port 3000 (Ports tab → globe icon)."
echo "   Demo logins are one-click from the banner, or use fan@/venue@/musician@/band@demo.com (password123)."
