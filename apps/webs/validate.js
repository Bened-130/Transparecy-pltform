#!/usr/bin/env node

// Simple validation script for Next.js web app files
console.log('🔍 Validating Web Dashboard Files\n');

const fs = require('fs');

// Basic checks for each file
const validations = [
  {
    file: 'src/app/page.tsx',
    checks: [
      (content) => content.includes('export default function') ? null : 'Missing default export',
      (content) => content.includes('DashboardStats') ? null : 'Missing DashboardStats component',
      (content) => content.includes('LiveTally') ? null : 'Missing LiveTally component',
      (content) => content.includes('SearchWidget') ? null : 'Missing SearchWidget component',
    ]
  },
  {
    file: 'src/components/DashboardStats.tsx',
    checks: [
      (content) => content.includes('export default') ? null : 'Missing default export',
      (content) => content.includes('function DashboardStats') ? null : 'Missing component function',
      (content) => content.includes('return') ? null : 'Missing return statement',
    ]
  },
  {
    file: 'src/components/LiveTally.tsx',
    checks: [
      (content) => content.includes('export default') ? null : 'Missing default export',
      (content) => content.includes('function LiveTally') ? null : 'Missing component function',
      (content) => content.includes('Recharts') || content.includes('BarChart') ? null : 'Missing chart components',
    ]
  },
  {
    file: 'src/components/Navigation.tsx',
    checks: [
      (content) => content.includes('export default') ? null : 'Missing default export',
      (content) => content.includes('function Navigation') ? null : 'Missing component function',
    ]
  },
  {
    file: 'src/components/SearchWidget.tsx',
    checks: [
      (content) => content.includes('export default') ? null : 'Missing default export',
      (content) => content.includes('function SearchWidget') ? null : 'Missing component function',
    ]
  },
  {
    file: 'src/components/RecentUploads.tsx',
    checks: [
      (content) => content.includes('export default') ? null : 'Missing default export',
      (content) => content.includes('function RecentUploads') ? null : 'Missing component function',
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
  console.log('🎉 All validations passed! Web dashboard is ready for testing.');
} else {
  console.log('⚠️  Some validations failed. Please check the issues above.');
}

console.log('\n💡 Next steps:');
console.log('  1. Run: npm install');
console.log('  2. Run: npm run dev (for Next.js development server)');
console.log('  3. Run: npm test (for Jest tests - requires full installation)');