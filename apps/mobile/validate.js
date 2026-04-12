#!/usr/bin/env node

// Simple validation script for React Native files
console.log('🔍 Validating Mobile App Files\n');

const fs = require('fs');

// Basic checks for each file
const validations = [
  {
    file: 'src/App.tsx',
    checks: [
      (content) => content.includes('import React') ? null : 'Missing React import',
      (content) => content.includes('NavigationContainer') ? null : 'Missing NavigationContainer',
      (content) => content.includes('useAuth') ? null : 'Missing useAuth hook',
      (content) => content.includes('export default function App') ? null : 'Missing default export',
    ]
  },
  {
    file: 'src/hooks/useAuth.tsx',
    checks: [
      (content) => content.includes('useReducer') ? null : 'Missing useReducer import',
      (content) => content.includes('interface User') ? null : 'Missing User interface',
      (content) => content.includes('export function useAuth') ? null : 'Missing useAuth export',
      (content) => content.includes('signIn') && content.includes('signOut') ? null : 'Missing auth methods',
    ]
  },
  {
    file: 'src/services/api.ts',
    checks: [
      (content) => content.includes('axios.create') ? null : 'Missing axios instance',
      (content) => content.includes('interceptors') ? null : 'Missing interceptors',
      (content) => content.includes('export') ? null : 'Missing exports',
    ]
  }
];

let totalPassed = 0;
let totalChecks = 0;

validations.forEach(({ file, checks }) => {
  console.log(`📄 Checking ${file}:`);
  try {
    const content = fs.readFileSync(file, 'utf8');
    let filePassed = 0;

    checks.forEach((check, index) => {
      const error = check(content);
      totalChecks++;

      if (error) {
        console.log(`  ❌ Check ${index + 1}: ${error}`);
      } else {
        console.log(`  ✅ Check ${index + 1}: PASSED`);
        filePassed++;
        totalPassed++;
      }
    });

    console.log(`  📊 ${file}: ${filePassed}/${checks.length} checks passed\n`);

  } catch (err) {
    console.log(`  ❌ File not found or unreadable: ${file}\n`);
  }
});

console.log(`🎯 Overall Results: ${totalPassed}/${totalChecks} checks passed`);

if (totalPassed === totalChecks) {
  console.log('🎉 All validations passed! Mobile app is ready for testing.');
} else {
  console.log('⚠️  Some validations failed. Please fix the issues above.');
}

console.log('\n💡 Next steps:');
console.log('  1. Run: npm install');
console.log('  2. Run: npm start (for Expo development)');
console.log('  3. Run: npm test (for Jest tests - requires full installation)');