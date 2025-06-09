#!/usr/bin/env node

/**
 * Database Management Help for GlowCTF
 * 
 * Shows all available database-related npm commands
 */

console.log('🗄️  GlowCTF Database Management Commands');
console.log('=====================================\n');

console.log('📋 SWITCHING DATABASES:');
console.log('  npm run db:switch                    # Interactive database switcher');
console.log('  npm run db:switch:mysql-local        # Switch to Local MySQL');
console.log('  npm run db:switch:mysql-aiven        # Switch to Aiven MySQL (Remote)');
console.log('  npm run db:switch:postgres-local     # Switch to Local PostgreSQL');
console.log('  npm run db:switch:postgres-aiven     # Switch to Aiven PostgreSQL (Remote)');
console.log('');

console.log('🔍 CONFIGURATION & STATUS:');
console.log('  npm run db:config                    # Show current database configuration');
console.log('');

console.log('🧪 TESTING CONNECTIONS:');
console.log('  npm run test:db-selection            # Test current database connection');
console.log('  npm run test:mysql-connection        # Test MySQL connection specifically');
console.log('  npm run test:pg-connection           # Test PostgreSQL connection specifically');
console.log('  npm run db:health                    # General database health check');
console.log('');

console.log('🚀 DATABASE OPERATIONS:');
console.log('  npm run db:push                      # Push schema changes to database');
console.log('');

console.log('📖 DOCUMENTATION:');
console.log('  See docs/DATABASE_SWITCHING.md for detailed usage guide');
console.log('');

console.log('💡 QUICK START:');
console.log('  1. Run "npm run db:switch" for interactive mode');
console.log('  2. Or use direct commands like "npm run db:switch:mysql-local"');
console.log('  3. Test with "npm run test:db-selection"');
console.log('  4. Apply changes with "npm run db:push"');
console.log('');