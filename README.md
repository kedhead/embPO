# StitchPay - Purchase Order Management System

StitchPay is a comprehensive purchase order management system designed specifically for embroidery businesses. This application helps to streamline the creation, management, and tracking of purchase orders.

## Features

- Create and manage purchase orders
- Track customer information
- Generate printable purchase order documents
- Monitor payment status
- Dashboard with business metrics
- Responsive design for desktop and mobile use

## Getting Started

### Running the Development Version

1. **Start the backend:**
   ```powershell
   cd backend
   # If using a virtual environment (recommended)
   ..\venv\Scripts\python app.py
   # OR without virtual environment
   python app.py
   ```

2. **Start the frontend:**
   ```powershell
   npm run dev
   ```

3. Access the application at `http://localhost:5186`

### Building the Standalone Application

StitchPay can be packaged as a standalone application with an installer:

1. **Run the build script:**
   ```powershell
   # Option 1: Using PowerShell
   .\build.ps1
   
   # Option 2: Using the batch file
   .\build.bat
   ```

2. The installer will be available in the `dist_electron` folder

## System Requirements

### For Development
- Node.js 16 or higher
- Python 3.7 or higher
- npm (comes with Node.js)

### For Running the Standalone Application
- Windows 10 or higher
- 4GB RAM
- 500MB disk space

## Technical Details

StitchPay is built using:
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Python Flask, SQLite
- **Packaging**: Electron, PyInstaller

## License

This project is proprietary software. All rights reserved.

## Support

For issues or assistance, please contact support@stitchpay.com
