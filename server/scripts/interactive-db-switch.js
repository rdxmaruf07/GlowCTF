#!/usr/bin/env node

/**
 * Interactive Database Switching Utility for GlowCTF
 *
 * This script provides an interactive menu to switch between database configurations
 * Usage: node server/scripts/interactive-db-switch.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configurations = {
  '1': { key: 'mysql-local', name: 'Local MySQL', description: 'MySQL running on localhost:3306' },
  '2': { key: 'mysql-aiven', name: 'Aiven MySQL (Remote)', description: 'MySQL hosted on Aiven cloud' },
  '3': { key: 'postgres-local', name: 'Local PostgreSQL', description: 'PostgreSQL running on localhost:5432' },
  '4': { key: 'postgres-aiven', name: 'Aiven PostgreSQL (Remote)', description: 'PostgreSQL hosted on Aiven cloud' }
};

function showMenu() {
  console.log('\n🗄️  GlowCTF Database Configuration Switcher');
  console.log('==========================================');
  console.log('\nSelect a database configuration:');
  console.log('');
  
  Object.entries(configurations).forEach(([num, config]) => {
    console.log(`${num}. ${config.name}`);
    console.log(`   ${config.description}`);
    console.log('');
  });
  
  console.log('0. Show current configuration');
  console.log('q. Quit');
  console.log('');
}

function getCurrentConfig() {
  try {
    const envPath = path.join(__dirname, '../../.env');
    const currentEnv = fs.readFileSync(envPath, 'utf8');
    
    if (currentEnv.includes('DB_HOST=mysql-1a05c8be-glowctf.l.aivencloud.com')) {
      return 'Aiven MySQL (Remote)';
    } else if (currentEnv.includes('DB_HOST=localhost') && currentEnv.includes('DB_PORT=3306')) {
      return 'Local MySQL';
    } else if (currentEnv.includes('DATABASE_URL=postgres://avnadmin:AVNS_uduiKV62Pj4Q1NuPvbM@pg-12c2c285-glowctf.l.aivencloud.com')) {
      return 'Aiven PostgreSQL (Remote)';
    } else if (currentEnv.includes('DATABASE_URL=postgresql://') && currentEnv.includes('localhost:5432')) {
      return 'Local PostgreSQL';
    } else {
      return 'Unknown or not configured';
    }
  } catch (error) {
    return 'Error reading configuration';
  }
}

async function switchDatabase(configKey) {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    const switchScript = path.join(__dirname, 'switch-database.js');
    
    const child = spawn('node', [switchScript, configKey], {
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Switch failed with code ${code}`));
      }
    });
  });
}

async function main() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = (question) => {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  };

  try {
    while (true) {
      showMenu();
      console.log(`📊 Current: ${getCurrentConfig()}`);
      console.log('');
      
      const answer = await askQuestion('Enter your choice: ');
      
      if (answer.toLowerCase() === 'q') {
        console.log('👋 Goodbye!');
        break;
      }
      
      if (answer === '0') {
        console.log(`\n📊 Current Database Configuration: ${getCurrentConfig()}\n`);
        await askQuestion('Press Enter to continue...');
        continue;
      }
      
      const config = configurations[answer];
      if (!config) {
        console.log('❌ Invalid choice. Please try again.\n');
        await askQuestion('Press Enter to continue...');
        continue;
      }
      
      console.log(`\n🔄 Switching to ${config.name}...`);
      
      try {
        await switchDatabase(config.key);
        console.log(`\n✅ Successfully switched to ${config.name}!`);
        console.log('🔄 Remember to restart your application to apply changes.');
        
        const testConnection = await askQuestion('\n🧪 Would you like to test the database connection? (y/n): ');
        if (testConnection.toLowerCase() === 'y') {
          console.log('\n🧪 Testing database connection...');
          const { spawn } = require('child_process');
          const testScript = path.join(__dirname, 'test-database-selection.js');
          
          const testChild = spawn('node', [testScript], {
            stdio: 'inherit'
          });
          
          await new Promise((resolve) => {
            testChild.on('close', resolve);
          });
        }
        
        const continueChoice = await askQuestion('\n🔄 Continue with another switch? (y/n): ');
        if (continueChoice.toLowerCase() !== 'y') {
          break;
        }
        
      } catch (error) {
        console.error(`❌ Failed to switch database: ${error.message}`);
        await askQuestion('Press Enter to continue...');
      }
    }
  } finally {
    rl.close();
  }
}

main().catch(console.error);