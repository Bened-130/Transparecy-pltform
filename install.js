#!/usr/bin/env node

// Quick installation script for Election Transparency Platform
console.log('Election Transparency Platform - Quick Installer\n');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname);

function runCommand(command, description, cwd = process.cwd()) {
  try {
    console.log(`${description}...`);
    execSync(command, { stdio: 'inherit', cwd });
    console.log(`${description} completed\n`);
  } catch (error) {
    console.log(`${description} failed: ${error.message}\n`);
    return false;
  }
  return true;
}

function checkPrerequisites() {
  console.log('Checking prerequisites...\n');

  const checks = [
    { command: 'node --version', name: 'Node.js', required: true },
    { command: 'npm --version', name: 'npm', required: true },
    { command: 'psql --version', name: 'PostgreSQL', required: false },
    { command: 'redis-cli --version', name: 'Redis', required: false },
  ];

  let allGood = true;

  checks.forEach(check => {
    try {
      execSync(check.command, { stdio: 'pipe' });
      console.log(`${check.name} - OK`);
    } catch (error) {
      if (check.required) {
        console.log(`${check.name} - MISSING (Required)`);
        allGood = false;
      } else {
        console.log(` ${check.name} - MISSING (Optional)`);
      }
    }
  });

  console.log('');
  return allGood;
}

function installDependencies() {
  console.log('Installing dependencies...\n');

  const installTargets = [
    { path: path.join(rootDir, 'packages/shared-types'), command: 'npm install --legacy-peer-deps', description: 'Install shared types' },
    { path: path.join(rootDir, 'apps/mobile'), command: 'npm install --legacy-peer-deps', description: 'Install mobile app dependencies' },
    { path: path.join(rootDir, 'apps/webs'), command: 'npm install', description: 'Install web dashboard dependencies' },
    { path: path.join(rootDir, 'services/api-gateway'), command: 'npm install', description: 'Install API gateway dependencies' },
    { path: path.join(rootDir, 'services/ai-processor'), command: 'npm install', description: 'Install AI processor dependencies' },
    { path: path.join(rootDir, 'database'), command: 'npm install', description: 'Install database tooling dependencies' },
  ];

  let allInstalled = true;

  for (const target of installTargets) {
    if (!fs.existsSync(target.path)) {
      console.log(`Skipping ${target.description}, path not found: ${target.path}\n`);
      allInstalled = false;
      continue;
    }

    if (!runCommand(target.command, target.description, target.path)) {
      allInstalled = false;
    }
  }

  if (!allInstalled) {
    console.log('Some dependencies failed to install. Please resolve errors and try again.\n');
  }

  return allInstalled;
}

function setupEnvironment() {
  console.log('Setting up environment...\n');

  const envFiles = [
    {
      path: 'services/api-gateway/.env',
      content: `# API Gateway Environment
DATABASE_URL=postgresql://username:password@localhost:5432/election_transparency
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
NODE_ENV=development
`
    },
    {
      path: 'services/ai-processor/.env',
      content: `# AI Processor Environment
DATABASE_URL=postgresql://username:password@localhost:5432/election_transparency
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
NODE_ENV=development
`
    },
    {
      path: 'apps/mobile/.env',
      content: `# Mobile App Environment
REACT_APP_API_URL=http://localhost:3000/api/v1
`
    }
  ];

  envFiles.forEach(env => {
    if (!fs.existsSync(env.path)) {
      fs.writeFileSync(env.path, env.content);
      console.log(`Created ${env.path}`);
    } else {
      console.log(`${env.path} already exists`);
    }
  });

  console.log('');
}

function validateInstallation() {
  console.log('Validating installation...\n');

  const validations = [
    { path: 'apps/mobile/package.json', description: 'Mobile app package.json' },
    { path: 'apps/webs/package.json', description: 'Web dashboard package.json' },
    { path: 'services/api-gateway/package.json', description: 'API Gateway package.json' },
    { path: 'services/ai-processor/package.json', description: 'AI Processor package.json' },
    { path: 'packages/shared-types/package.json', description: 'Shared types package.json' },
  ];

  let allValid = true;

  validations.forEach(validation => {
    if (fs.existsSync(validation.path)) {
      console.log(`${validation.description} - Found`);
    } else {
      console.log(`${validation.description} - Missing`);
      allValid = false;
    }
  });

  console.log('');
  return allValid;
}

async function main() {
  console.log('Election Transparency Platform Installer\n');
  console.log('This script will help you install and set up the platform.\n');

  // Step 1: Check prerequisites
  if (!checkPrerequisites()) {
    console.log('Prerequisites check failed. Please install required software and try again.\n');
    process.exit(1);
  }

  // Step 2: Validate project structure
  if (!validateInstallation()) {
    console.log('Project structure validation failed. Please ensure all files are present.\n');
    process.exit(1);
  }

  // Step 3: Install dependencies
  if (!installDependencies()) {
    console.log('Dependency installation failed. Please check the installation guide.\n');
    process.exit(1);
  }

  // Step 4: Setup environment
  setupEnvironment();

  console.log('Installation completed successfully!\n');
  console.log('Next steps:');
  console.log('1. Set up your database: createdb election_transparency');
  console.log('2. Update .env files with your actual credentials');
  console.log('3. Run database migrations: cd database && npm run migrate');
  console.log('4. Start development servers: npm run dev');
  console.log('5. Test the applications: npm test\n');
  console.log('For detailed instructions, see INSTALLATION.md\n');
}

// Run the installer
main().catch(error => {
  console.error('Installation failed:', error.message);
  process.exit(1);
});