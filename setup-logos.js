const fs = require('fs');
const path = require('path');

// Define paths
const sourcePath = path.join(__dirname, 'frontend', 'public', 'logos');
const targetPath = path.join(__dirname, 'public', 'logos');

// Check if source directory exists
if (!fs.existsSync(sourcePath)) {
  console.error(`Source directory not found: ${sourcePath}`);
  process.exit(1);
}

// Create target directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'));
}

// Create symlink or copy files
try {
  if (fs.existsSync(targetPath)) {
    console.log('Target directory already exists. Skipping...');
  } else {
    // Try creating a symlink first
    try {
      fs.symlinkSync(sourcePath, targetPath, 'dir');
      console.log(`Created symlink from ${sourcePath} to ${targetPath}`);
    } catch (symlinkErr) {
      console.log('Could not create symlink, copying files instead...');
      
      // If symlink fails, copy files
      fs.mkdirSync(targetPath);
      
      const files = fs.readdirSync(sourcePath);
      files.forEach(file => {
        const sourceFile = path.join(sourcePath, file);
        const targetFile = path.join(targetPath, file);
        fs.copyFileSync(sourceFile, targetFile);
      });
      
      console.log(`Copied logo files from ${sourcePath} to ${targetPath}`);
    }
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
}
