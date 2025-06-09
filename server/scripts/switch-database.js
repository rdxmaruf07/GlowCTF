#!/usr/bin/env node

/**
 * Database Switching Utility for GlowCTF
 *
 * This script helps you switch between different database configurations
 * Usage: node server/scripts/switch-database.js [mysql-local|mysql-aiven|postgres-aiven|postgres-local]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');

const configurations = {
  'mysql-local': {
    name: 'Local MySQL',
    env: `# GlowCTF Environment Configuration
# ===== DATABASE CONFIGURATION =====
# GlowCTF supports both MySQL and PostgreSQL
# The application will automatically choose the database based on which environment variables are set
# Priority: MySQL (if MYSQL_DATABASE_URL or MySQL config is set) > PostgreSQL (if DATABASE_URL is set)

# ===== ACTIVE DATABASE: LOCAL MYSQL =====
DB_HOST=localhost
DB_USER=glowctf_user
DB_PASSWORD=Maruf078692
DB_PORT=3306
DB_NAME=glowctf

# Alternative MySQL connection string format
# MYSQL_DATABASE_URL=mysql://glowctf_user:Maruf078692@localhost:3306/glowctf

# Disabled databases (comment out to disable)
# DATABASE_URL=postgres://... # PostgreSQL disabled`
  },

  'mysql-aiven': {
    name: 'Aiven MySQL (Remote)',
    env: `# GlowCTF Environment Configuration
# ===== DATABASE CONFIGURATION =====
# GlowCTF supports both MySQL and PostgreSQL
# The application will automatically choose the database based on which environment variables are set
# Priority: MySQL (if MYSQL_DATABASE_URL or MySQL config is set) > PostgreSQL (if DATABASE_URL is set)

# ===== ACTIVE DATABASE: AIVEN MYSQL =====
DB_HOST=mysql-1a05c8be-glowctf.l.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=AVNS_tIHApPG04Np3XLDk_6Y
DB_PORT=20393
DB_NAME=defaultdb
MYSQL_DATABASE_URL=mysql://avnadmin:AVNS_tIHApPG04Np3XLDk_6Y@mysql-1a05c8be-glowctf.l.aivencloud.com:20393/defaultdb

# Disabled databases (comment out to disable)
# DATABASE_URL=postgres://... # PostgreSQL disabled`
  },

  'postgres-aiven': {
    name: 'Aiven PostgreSQL (Remote)',
    env: `# GlowCTF Environment Configuration
# ===== DATABASE CONFIGURATION =====
# GlowCTF supports both MySQL and PostgreSQL
# The application will automatically choose the database based on which environment variables are set
# Priority: MySQL (if MYSQL_DATABASE_URL or MySQL config is set) > PostgreSQL (if DATABASE_URL is set)

# ===== ACTIVE DATABASE: AIVEN POSTGRESQL =====
DATABASE_URL=postgres://avnadmin:AVNS_uduiKV62Pj4Q1NuPvbM@pg-12c2c285-glowctf.l.aivencloud.com:20393/defaultdb?sslmode=require&ssl=true

# Disabled databases (comment out to disable)
# DB_HOST=... # MySQL disabled
# MYSQL_DATABASE_URL=mysql://... # MySQL disabled`
  },

  'postgres-local': {
    name: 'Local PostgreSQL',
    env: `# GlowCTF Environment Configuration
# ===== DATABASE CONFIGURATION =====
# GlowCTF supports both MySQL and PostgreSQL
# The application will automatically choose the database based on which environment variables are set
# Priority: MySQL (if MYSQL_DATABASE_URL or MySQL config is set) > PostgreSQL (if DATABASE_URL is set)

# ===== ACTIVE DATABASE: LOCAL POSTGRESQL =====
DATABASE_URL=postgresql://glowctf_user:your_secure_password@localhost:5432/glowctf

# Disabled databases (comment out to disable)
# DB_HOST=... # MySQL disabled
# MYSQL_DATABASE_URL=mysql://... # MySQL disabled`
  }
};

function getCurrentEnv() {
  try {
    return fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.error('Error reading .env file:', error.message);
    process.exit(1);
  }
}

function backupCurrentEnv() {
  const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
  const backupPath = path.join(__dirname, `../../.env.backup.${timestamp}`);
  
  try {
    const currentEnv = getCurrentEnv();
    fs.writeFileSync(backupPath, currentEnv);
    console.log(`📁 Current .env backed up to: .env.backup.${timestamp}`);
    return backupPath;
  } catch (error) {
    console.error('Error backing up .env file:', error.message);
    return null;
  }
}

function updateDatabaseConfig(configKey) {
  const config = configurations[configKey];
  
  if (!config) {
    console.error('Invalid configuration. Available options:');
    Object.keys(configurations).forEach(key => {
      console.log(`  ${key}: ${configurations[key].name}`);
    });
    process.exit(1);
  }

  // Backup current configuration
  backupCurrentEnv();
  
  const currentEnv = getCurrentEnv();
  
  // Extract non-database environment variables
  const lines = currentEnv.split('\n');
  const nonDbLines = [];
  const dbRelatedPrefixes = [
    'DB_HOST=', 'DB_USER=', 'DB_PASSWORD=', 'DB_NAME=', 'DB_PORT=',
    'MYSQL_DATABASE_URL=', 'DATABASE_URL=',
    '# DB_HOST=', '# DB_USER=', '# DB_PASSWORD=', '# DB_NAME=', '# DB_PORT=',
    '# MYSQL_DATABASE_URL=', '# DATABASE_URL='
  ];
  
  const dbRelatedKeywords = [
    '===== DATABASE CONFIGURATION =====',
    'ACTIVE DATABASE:',
    'MySQL Configuration',
    'PostgreSQL Configuration',
    'Disabled databases',
    'MySQL disabled',
    'PostgreSQL disabled',
    'GlowCTF supports both MySQL and PostgreSQL',
    'The application will automatically choose the database',
    'Priority: MySQL'
  ];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines that are part of database section
    if (trimmedLine === '' && lines.indexOf(line) > 0) {
      const prevLine = lines[lines.indexOf(line) - 1];
      const nextLine = lines[lines.indexOf(line) + 1];
      if (prevLine && nextLine && 
          (dbRelatedPrefixes.some(prefix => prevLine.startsWith(prefix)) ||
           dbRelatedKeywords.some(keyword => prevLine.includes(keyword)) ||
           dbRelatedPrefixes.some(prefix => nextLine.startsWith(prefix)) ||
           dbRelatedKeywords.some(keyword => nextLine.includes(keyword)))) {
        continue;
      }
    }
    
    // Skip database-related lines
    const isDbRelated = dbRelatedPrefixes.some(prefix => line.startsWith(prefix)) ||
                       dbRelatedKeywords.some(keyword => line.includes(keyword)) ||
                       (line.startsWith('#') && line.includes('database')) ||
                       (line.startsWith('#') && line.includes('Database'));
    
    if (!isDbRelated) {
      nonDbLines.push(line);
    }
  }
  
  // Clean up extra empty lines
  while (nonDbLines.length > 0 && nonDbLines[nonDbLines.length - 1].trim() === '') {
    nonDbLines.pop();
  }
  
  // Combine non-database variables with new database configuration
  const finalEnv = [...nonDbLines, '', config.env].join('\n');
  
  try {
    fs.writeFileSync(envPath, finalEnv);
    console.log(`✅ Successfully switched to: ${config.name}`);
    console.log(`📝 Updated .env file with ${configKey} configuration`);
    console.log(`🔄 Restart your application to apply changes`);
    console.log(`💡 Test connection with: node server/scripts/test-database-selection.js`);
  } catch (error) {
    console.error('Error writing .env file:', error.message);
    process.exit(1);
  }
}

function showCurrentConfig() {
  const currentEnv = getCurrentEnv();
  
  console.log('🔍 Current Database Configuration:');
  console.log('================================');
  
  if (currentEnv.includes('DB_HOST=mysql-1a05c8be-glowctf.l.aivencloud.com')) {
    console.log('📊 Active Database: Aiven MySQL (Remote)');
  } else if (currentEnv.includes('DB_HOST=localhost') && currentEnv.includes('DB_PORT=3306')) {
    console.log('📊 Active Database: Local MySQL');
  } else if (currentEnv.includes('DATABASE_URL=postgres://avnadmin:AVNS_uduiKV62Pj4Q1NuPvbM@pg-12c2c285-glowctf.l.aivencloud.com')) {
    console.log('📊 Active Database: Aiven PostgreSQL (Remote)');
  } else if (currentEnv.includes('DATABASE_URL=postgresql://') && currentEnv.includes('localhost:5432')) {
    console.log('📊 Active Database: Local PostgreSQL');
  } else {
    console.log('❓ Database configuration not recognized or not set');
  }
  
  console.log('\n📋 Available Configurations:');
  Object.keys(configurations).forEach(key => {
    console.log(`  ${key}: ${configurations[key].name}`);
  });
  
  console.log('\n💡 Usage: node server/scripts/switch-database.js [config-name]');
  console.log('💡 Interactive mode: node server/scripts/interactive-db-switch.js');
  console.log('💡 Test connection: node server/scripts/test-database-selection.js');
}

// Main execution
const configKey = process.argv[2];

if (!configKey) {
  showCurrentConfig();
} else {
  updateDatabaseConfig(configKey);
}