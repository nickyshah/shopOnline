#!/bin/bash

# Quick script to restore admin role for admin@rawnode.com
# Usage: ./restore-admin.sh

echo "🔧 Restoring admin role for admin@rawnode.com..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    exit 1
fi

# Get the service role key from .env.local
source .env.local

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.local"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    exit 1
fi

# Make API call to restore admin
echo "📡 Calling restore admin API..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/admin/restore-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@rawnode.com"}')

if echo "$RESPONSE" | grep -q "success"; then
    echo "✅ Admin role restored successfully!"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo "❌ Failed to restore admin role"
    echo "$RESPONSE"
    echo ""
    echo "💡 Alternative: Run this SQL in Supabase Studio (http://127.0.0.1:54333):"
    echo ""
    echo "UPDATE public.profiles"
    echo "SET role = 'admin'"
    echo "WHERE id IN ("
    echo "  SELECT id FROM auth.users WHERE email = 'admin@rawnode.com'"
    echo ");"
    exit 1
fi

