#!/usr/bin/env node

// Minimal test runner for web dashboard logic validation
console.log('🖥️ Running Minimal Web Dashboard Tests\n');

const fs = require('fs');
const path = require('path');

// Test 1: File structure validation
console.log('📁 File Structure Tests:');
const requiredFiles = [
  'src/app/page.tsx',
  'src/components/DashboardStats.tsx',
  'src/components/LiveTally.tsx',
  'src/components/Navigation.tsx',
  'src/components/SearchWidget.tsx',
  'src/components/RecentUploads.tsx'
];

let fileTestsPassed = 0;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - EXISTS`);
    fileTestsPassed++;
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

console.log(`📊 File Tests: ${fileTestsPassed}/${requiredFiles.length} passed\n`);

// Test 2: Component structure validation
console.log('🧩 Component Structure Validation:');
const components = [
  { path: 'src/app/page.tsx', name: 'Page' },
  { path: 'src/components/DashboardStats.tsx', name: 'DashboardStats' },
  { path: 'src/components/LiveTally.tsx', name: 'LiveTally' },
  { path: 'src/components/Navigation.tsx', name: 'Navigation' },
  { path: 'src/components/SearchWidget.tsx', name: 'SearchWidget' },
  { path: 'src/components/RecentUploads.tsx', name: 'RecentUploads' }
];

components.forEach(comp => {
  if (fs.existsSync(comp.path)) {
    const content = fs.readFileSync(comp.path, 'utf8');
    const hasDefaultExport = content.includes('export default');
    const hasFunction = content.includes(`function ${comp.name}`) || content.includes('export default function');
    const hasJSX = content.includes('<') && content.includes('>');
    const hasTailwind = content.includes('className');

    console.log(`${comp.name}:`);
    console.log(`  ${hasDefaultExport ? '✅' : '❌'} Default export`);
    console.log(`  ${hasFunction ? '✅' : '❌'} Function component`);
    console.log(`  ${hasJSX ? '✅' : '❌'} JSX structure`);
    console.log(`  ${hasTailwind ? '✅' : '❌'} Tailwind classes`);
  }
});

// Test 3: Dashboard features validation
console.log('\n📊 Dashboard Features Validation:');
const dashboardContent = fs.readFileSync('src/app/page.tsx', 'utf8');
const features = [
  { name: 'DashboardStats import', check: dashboardContent.includes('DashboardStats') },
  { name: 'LiveTally import', check: dashboardContent.includes('LiveTally') },
  { name: 'Navigation import', check: dashboardContent.includes('Navigation') },
  { name: 'SearchWidget import', check: dashboardContent.includes('SearchWidget') },
  { name: 'RecentUploads import', check: dashboardContent.includes('RecentUploads') },
  { name: 'State management', check: dashboardContent.includes('useState') || dashboardContent.includes('useEffect') },
  { name: 'Responsive layout', check: dashboardContent.includes('grid') || dashboardContent.includes('flex') }
];

features.forEach(feature => {
  console.log(`${feature.check ? '✅' : '❌'} ${feature.name}`);
});

// Test 4: Chart component validation
console.log('\n📈 Chart Component Validation:');
const chartContent = fs.readFileSync('src/components/LiveTally.tsx', 'utf8');
const chartFeatures = [
  { name: 'Recharts import', check: chartContent.includes('recharts') },
  { name: 'BarChart usage', check: chartContent.includes('BarChart') },
  { name: 'ResponsiveContainer', check: chartContent.includes('ResponsiveContainer') },
  { name: 'Data mapping', check: chartContent.includes('map') || chartContent.includes('data') }
];

chartFeatures.forEach(feature => {
  console.log(`${feature.check ? '✅' : '❌'} ${feature.name}`);
});

console.log('\n🎉 Web Dashboard Testing Complete!');
console.log('💡 For full React tests, install dependencies: npm install');