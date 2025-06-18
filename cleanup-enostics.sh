#!/bin/bash

# 🧹 Enostics Platform Cleanup Script
# This script removes all unnecessary files and leaves only the core essentials

echo "🧹 Starting Enostics Platform Cleanup..."
echo "This will remove 40+ unnecessary files and simplify the platform"
echo ""

# Create backup first
echo "📦 Creating backup..."
git add .
git commit -m "Backup before major cleanup" 2>/dev/null || echo "No changes to commit"

# Count files before cleanup
FILES_BEFORE=$(find . -name "*.sql" -o -name "*.js" -o -name "*.md" | grep -v node_modules | grep -v .git | wc -l)
echo "📊 Files before cleanup: $FILES_BEFORE"

echo ""
echo "🗑️  Removing unnecessary SQL files..."

# Remove complex SQL migration files
rm -f PHASE_1_FIXED_DEPLOYMENT.sql
rm -f PHASE_1_STEP_BY_STEP_DEPLOYMENT.sql
rm -f enostics-clean-database-schema.sql
rm -f create-contacts-system.sql
rm -f enostics-subscription-billing-schema.sql
rm -f enostics-email-settings-migration.sql
rm -f database-universal-endpoint-migration.sql
rm -f database-inbox-setup.sql
rm -f fix-missing-inbox-tables.sql
rm -f nuclear-fix.sql
rm -f emergency-fix-registration.sql
rm -f fix-profiles-trigger.sql
rm -f fix-registration-trigger.sql
rm -f step1-disable-triggers.sql
rm -f supabase-email-settings.sql
rm -f create-missing-tables.sql
rm -f essential-signup-function.sql

echo "✅ Removed complex SQL files"

echo ""
echo "🗑️  Removing debug/test files..."

# Remove debug and test files
rm -f analyze-user-tables-comprehensive.js
rm -f analyze-database-state.js
rm -f debug-database.js
rm -f debug-supabase-config.js
rm -f debug-registration.js
rm -f test-fixed-registration.js
rm -f test-after-nuclear-fix.js
rm -f test-registration-no-triggers.js
rm -f test-perfect-signup.js
rm -f check-profiles-table.js
rm -f simple-db-check.js
rm -f find-all-triggers.js
rm -f deploy-user-system.js

echo "✅ Removed debug/test files"

echo ""
echo "🗑️  Removing outdated documentation..."

# Remove outdated documentation
rm -f PHASE_1_COMPLETE.md
rm -f PHASE_2_COMPLETE.md
rm -f PHASE_2_5_COMPLETE.md
rm -f PHASE_3_1_UNIVERSAL_INBOX_COMPLETE.md
rm -f PERFECT_SIGNUP_FLOW_SUMMARY.md
rm -f IMPLEMENTATION_SUMMARY.md
rm -f STRATEGIC_ANALYSIS_UNIFIED_ENDPOINT.md
rm -f UNIVERSAL_ENDPOINT_MIGRATION.md
rm -f BACKGROUND_GUIDE.md
rm -f setup-supabase-mcp.md
rm -f setup-cursor-mcp.md

echo "✅ Removed outdated documentation"

echo ""
echo "🗑️  Removing build artifacts..."

# Remove build artifacts (keep core config)
rm -f tsconfig.tsbuildinfo

echo "✅ Removed build artifacts"

# Count files after cleanup
FILES_AFTER=$(find . -name "*.sql" -o -name "*.js" -o -name "*.md" | grep -v node_modules | grep -v .git | wc -l)

echo ""
echo "📊 CLEANUP SUMMARY:"
echo "Files before: $FILES_BEFORE"
echo "Files after:  $FILES_AFTER"
echo "Removed:      $((FILES_BEFORE - FILES_AFTER)) files"

echo ""
echo "✅ CLEANUP COMPLETE!"
echo ""
echo "📁 REMAINING ESSENTIAL FILES:"
echo "   database/setup.sql           - Simple working schema"
echo "   src/                        - Application code"
echo "   .cursorrules                - Platform rules"
echo "   package.json                - Dependencies"
echo "   README.md                   - Basic docs"
echo "   MCP_SETUP_COMPLETE.md       - MCP documentation"
echo "   ENOSTICS_CLEANUP_PLAN.md    - This cleanup plan"
echo ""
echo "🎯 Platform is now focused on the core mission:"
echo "   Every user gets /v1/username → Receives data → Views in dashboard"
echo ""
echo "🚀 Next: Create simple enostics-core-schema.sql and update application" 