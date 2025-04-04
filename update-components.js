const fs = require('fs');
const path = require('path');

// Define the source and target directories
const sourceDir = path.join(__dirname, 'components');
const targetDir = path.join(__dirname, 'src', 'components');

// List of components we want to ensure are available
const requiredComponents = [
  'VoiceControl',
  'StatusPanel',
  'VideoFeed',
  'Telemetry',
  'AlertsPanel',
  'BatteryIndicator',
  'DJIControlPanel'
];

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Function to copy a file
function copyFile(source, target) {
  fs.copyFileSync(source, target);
  console.log(`Copied ${source} to ${target}`);
}

// Function to copy a directory recursively
function copyDirectory(source, target) {
  // Create the target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  // Get all files and directories in the source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy subdirectory
      copyDirectory(sourcePath, targetPath);
    } else {
      // Check if file already exists in the target directory
      if (fs.existsSync(targetPath)) {
        console.log(`File ${targetPath} already exists. Checking if it needs to be updated...`);
        
        // Simple check: compare file sizes
        const sourceStats = fs.statSync(sourcePath);
        const targetStats = fs.statSync(targetPath);
        
        if (sourceStats.size !== targetStats.size) {
          console.log(`Updating ${targetPath} with newer version from ${sourcePath}`);
          copyFile(sourcePath, targetPath);
        } else {
          console.log(`No changes needed for ${targetPath}`);
        }
      } else {
        // Copy the file
        copyFile(sourcePath, targetPath);
      }
    }
  }
}

// Create placeholder component if it doesn't exist
function createPlaceholderComponent(componentName) {
  const targetFile = path.join(targetDir, `${componentName}.js`);
  
  if (!fs.existsSync(targetFile)) {
    console.log(`Creating placeholder for ${componentName}...`);
    
    const placeholderContent = `import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ${componentName} = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ${componentName}
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          ${componentName} component will be implemented soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ${componentName};
`;
    
    fs.writeFileSync(targetFile, placeholderContent);
    console.log(`Created placeholder component: ${targetFile}`);
  }
}

// Check if the source directory exists
if (fs.existsSync(sourceDir)) {
  console.log(`Moving components from ${sourceDir} to ${targetDir}`);
  copyDirectory(sourceDir, targetDir);
  console.log('Component migration completed successfully!');
} else {
  console.error(`Source directory ${sourceDir} does not exist or is not accessible.`);
}

// Check for the required components and create placeholders if needed
console.log('\nChecking for required components...');
requiredComponents.forEach(componentName => {
  const sourceFile = path.join(sourceDir, `${componentName}.js`);
  const targetFile = path.join(targetDir, `${componentName}.js`);
  
  if (!fs.existsSync(sourceFile) && !fs.existsSync(targetFile)) {
    createPlaceholderComponent(componentName);
  } else {
    console.log(`${componentName} component already exists.`);
  }
});

console.log('\nAll components are now available in the src/components directory.');
