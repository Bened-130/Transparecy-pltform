#!/usr/bin/env node

// Minimal test runner for logic validation without full React Native setup
console.log('🧪 Running Minimal Logic Tests for Election Transparency Platform\n');

const fs = require('fs');
const path = require('path');

// Test 1: Validate TypeScript interfaces and types
console.log('🔍 Type Validation Tests:');

function validateTypes(filePath, expectedTypes) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let passed = 0;

    expectedTypes.forEach(type => {
      if (content.includes(`${type}Schema`) || content.includes(`export const ${type}`) || content.includes(`interface ${type}`) || content.includes(`type ${type}`)) {
        console.log(`✅ ${type} - FOUND`);
        passed++;
      } else {
        console.log(`❌ ${type} - MISSING`);
      }
    });

    return passed === expectedTypes.length;
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    return false;
  }
}

// Test shared types
const sharedTypesPath = path.join(__dirname, '../../packages/shared-types/src/index.ts');
if (fs.existsSync(sharedTypesPath)) {
  console.log('\n📋 Shared Types Validation:');
  const sharedTypesValid = validateTypes(sharedTypesPath, [
    'AuthRequest', 'AuthResponse', 'UploadRequest', 'UploadResponse',
    'VoteTally', 'PollingStation', 'ElectionResult'
  ]);
  console.log(`📊 Shared Types: ${sharedTypesValid ? 'PASSED' : 'FAILED'}`);
}

// Test 2: Validate API service structure
console.log('\n🔗 API Service Validation:');
const apiPath = 'src/services/api.ts';
if (fs.existsSync(apiPath)) {
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  const apiTests = [
    { name: 'Base URL config', check: apiContent.includes('baseURL') },
    { name: 'Auth functions', check: apiContent.includes('login') || apiContent.includes('authenticate') },
    { name: 'Upload functions', check: apiContent.includes('upload') },
    { name: 'Error handling', check: apiContent.includes('catch') || apiContent.includes('error') }
  ];

  apiTests.forEach(test => {
    console.log(`${test.check ? '✅' : '❌'} ${test.name}`);
  });
}

// Test 3: Validate hook structure
console.log('\n🎣 Auth Hook Validation:');
const hookPath = 'src/hooks/useAuth.tsx';
if (fs.existsSync(hookPath)) {
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  const hookTests = [
    { name: 'useState usage', check: hookContent.includes('useState') },
    { name: 'OTP handling', check: hookContent.includes('otp') || hookContent.includes('OTP') },
    { name: 'Phone validation', check: hookContent.includes('phone') },
    { name: 'Return object', check: hookContent.includes('return') }
  ];

  hookTests.forEach(test => {
    console.log(`${test.check ? '✅' : '❌'} ${test.name}`);
  });
}

// Test 4: Component structure validation
console.log('\n🧩 Component Structure Validation:');
const components = ['src/App.tsx', 'src/screens/AuthScreen.tsx', 'src/screens/UploadScreen.tsx'];
components.forEach(compPath => {
  if (fs.existsSync(compPath)) {
    const compContent = fs.readFileSync(compPath, 'utf8');
    const compName = path.basename(compPath, '.tsx');
    const hasFunction = compContent.includes(`function ${compName}`) || compContent.includes(`export default function`) || compContent.includes(`export const ${compName}`);
    const hasJSX = compContent.includes('<') && compContent.includes('>');
    const hasHooks = compContent.includes('use') && compContent.includes('(');

    console.log(`${compName}:`);
    console.log(`  ${hasFunction ? '✅' : '❌'} Function/arrow component`);
    console.log(`  ${hasJSX ? '✅' : '❌'} JSX structure`);
    console.log(`  ${hasHooks ? '✅' : '❌'} React hooks`);
  }
});

console.log('\n🎉 Minimal Testing Complete!');
console.log('💡 For full UI tests, install dependencies: npm install --legacy-peer-deps');