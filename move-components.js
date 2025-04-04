const fs = require('fs');
const path = require('path');

// Define the source and target directories
const sourceDir = path.join(__dirname, 'components');
const targetDir = path.join(__dirname, 'src', 'components');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Function to copy a file
function copyFile(source, target) {
  const targetFile = target;
  
  // If target is a directory, create a file with the same name as source
  if (fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
    targetFile = path.join(target, path.basename(source));
  }
  
  fs.copyFileSync(source, targetFile);
  console.log(`Copied ${source} to ${targetFile}`);
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
        console.log(`File already exists: ${targetPath}`);
      } else {
        // Copy the file
        copyFile(sourcePath, targetPath);
      }
    }
  }
}

// Check if the source directory exists
if (fs.existsSync(sourceDir)) {
  console.log(`Moving components from ${sourceDir} to ${targetDir}`);
  copyDirectory(sourceDir, targetDir);
  console.log('Component migration completed successfully!');
} else {
  console.error(`Source directory does not exist: ${sourceDir}`);
}
