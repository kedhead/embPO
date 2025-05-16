# StitchPay - Standalone Application Build Guide

This document provides instructions for building and running the StitchPay application as a standalone executable with installer.

## Prerequisites

Before you begin, make sure you have the following installed:
- Node.js (v16 or later)
- Python (v3.7 or later)
- npm (comes with Node.js)
- PowerShell

## Building the Application

1. Install the required dependencies:
   ```powershell
   # Frontend dependencies
   npm install

   # Backend dependencies
   cd backend
   pip install -r requirements.txt
   pip install pyinstaller
   cd ..
   ```

2. Add an icon file:
   - Place an `.ico` file named `icon.ico` in the `electron` folder

3. Run the build script:
   ```powershell
   # Execute the build script
   .\build.ps1
   ```

4. Once the build is complete, you'll find the installer in the `dist_electron` directory.

## Development

For development, you can run the application in development mode:

```powershell
# Run frontend and Electron in development mode
npm run electron:dev

# In a separate terminal, run the backend
cd backend
python app.py
```

## Project Structure

- `electron/` - Contains Electron-specific files
- `src/` - Frontend React application
- `backend/` - Flask backend application
- `dist/` - Built frontend files (after running `npm run build`)
- `backend_dist/` - Built backend files (after running PyInstaller)
- `dist_electron/` - Final packaged application and installer

## Troubleshooting

- If you encounter any issues during the build process, check the logs in the console.
- Make sure you have the correct permissions to write to the output directories.
- For backend packaging issues, try running PyInstaller with the `--debug` flag.
