#!/usr/bin/env node

// Simple test runner for basic functionality checks
console.log('🧪 Running Basic Tests for Election Transparency Platform\n');

// Test 1: Check if files exist
const fs = require('fs');
const path = require('path');

const testFiles = [
  'src/App.tsx',
  'src/hooks/useAuth.tsx',
  'src/services/api.ts',
  'src/screens/AuthScreen.tsx',
  'src/screens/StatusScreen.tsx',
  'src/screens/UploadScreen.tsx'
];

console.log('📁 File Existence Tests:');
let passed = 0;
let total = testFiles.length;

testFiles.forEach(file => {
  try {
    fs.accessSync(file, fs.constants.F_OK);
    console.log(`✅ ${file} - EXISTS`);
    passed++;
  } catch (err) {
    console.log(`❌ ${file} - MISSING`);
  }
});

console.log(`\n📊 File Tests: ${passed}/${total} passed\n`);

// Test 2: Basic syntax check (TypeScript compilation)
console.log('🔍 Basic Syntax Tests:');
const { execSync } = require('child_process');

try {
  // Try to compile TypeScript files
  execSync('npx tsc --noEmit --skipLibCheck src/App.tsx', { stdio: 'pipe' });
  console.log('✅ App.tsx - SYNTAX OK');
} catch (error) {
  console.log('❌ App.tsx - SYNTAX ERROR');
}

try {
  execSync('npx tsc --noEmit --skipLibCheck src/hooks/useAuth.tsx', { stdio: 'pipe' });
  console.log('✅ useAuth.tsx - SYNTAX OK');
} catch (error) {
  console.log('❌ useAuth.tsx - SYNTAX ERROR');
}

try {
  execSync('npx tsc --noEmit --skipLibCheck src/services/api.ts', { stdio: 'pipe' });
  console.log('✅ api.ts - SYNTAX OK');
} catch (error) {
  console.log('❌ api.ts - SYNTAX ERROR');
}

console.log('\n🎉 Basic Testing Complete!');
console.log('💡 For full Jest tests, run: npm install && npm test');
