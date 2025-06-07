const { execSync } = require('child_process');
const path = require('path');

try {
  // Ensure we're in the project root
  process.chdir(__dirname);
  
  // Run the build command using npx to avoid permission issues
  execSync('npx vite build', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 