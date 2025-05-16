import { app, BrowserWindow, dialog } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';
import axios from 'axios';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let flaskProcess;
let flaskStarted = false;
let retries = 0;
const MAX_RETRIES = 5;  // Increased retries

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'stitchpay_Klq_icon.ico')
  });

  const startUrl = isDev 
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  const checkFlaskServer = async () => {
    if (flaskStarted) {
      mainWindow.loadURL(startUrl);
    } else {
      if (retries < MAX_RETRIES) {
        retries++;
        console.log(`Waiting for Flask server to start... (attempt ${retries}/${MAX_RETRIES})`);
        
        // Try to verify Flask server is responsive
        const isRunning = await verifyFlaskServer();
        
        if (isRunning) {
          console.log('Flask server verified as running. Loading application...');
          mainWindow.loadURL(startUrl);
        } else {
          setTimeout(checkFlaskServer, 2000); // Increased wait time
        }
      } else {
        console.error('Flask server failed to start after multiple attempts');
        dialog.showErrorBox(
          'Server Error', 
          'The backend server failed to start. The application may not function correctly.'
        );
        mainWindow.loadURL(startUrl);
      }
    }
  };
  
  const handleFlaskCheckError = (reason) => {
    console.error(`Flask server connection failed: ${reason}`);
    dialog.showErrorBox(
      'Server Error', 
      'The backend server failed to start. The application may not function correctly.'
    );
    mainWindow.loadURL(startUrl);
  };

  setTimeout(checkFlaskServer, 1000);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
    if (flaskProcess) {
      flaskProcess.kill();
      flaskProcess = null;
    }
  });
}

function startFlaskServer() {
  const flaskExecutablePath = isDev 
    ? 'python'
    : path.join(process.resourcesPath, 'flask_server', 'flask_server.exe');

  // Log the executable path to help with debugging
  console.log(`Flask executable path: ${flaskExecutablePath}`);
  console.log(`Flask executable exists: ${fs.existsSync(flaskExecutablePath)}`);
  
  const flaskArgs = isDev 
    ? [path.join(__dirname, '../backend/app.py')] 
    : [];

  console.log(`Starting Flask server: ${flaskExecutablePath} ${flaskArgs.join(' ')}`);

  flaskProcess = spawn(flaskExecutablePath, flaskArgs);
  flaskProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`Flask stdout: ${output}`);
    
    // More explicit detection of server startup
    if (output.includes('Running on') || output.includes('Listening at')) {
      console.log('Flask server started successfully');
      
      // Don't set flaskStarted=true here - we'll verify with API call
      setTimeout(() => {
        if (!flaskStarted) {
          console.log('Verifying Flask server is operational via health check...');
        }
      }, 1000);
    }
  });

  flaskProcess.stderr.on('data', (data) => {
    const errorMessage = data.toString();
    console.error(`Flask stderr: ${errorMessage}`);
    // Additional error handling logic can be added here
  });

  flaskProcess.on('close', (code) => {
    console.log(`Flask process exited with code ${code}`);
    flaskStarted = false;

    if (mainWindow && code !== 0) {
      dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'Server Error',
        message: 'The backend server has stopped unexpectedly. The application will now close.',
        buttons: ['OK']
      }).then(() => {
        app.quit();
      });
    }
  });
}

// Function to verify Flask server is responding to API requests
async function verifyFlaskServer() {
  // Try multiple endpoints to check server health
  const healthEndpoints = [
    'http://localhost:5000/',             // Root endpoint
    'http://localhost:5000/health',       // Direct health endpoint 
    'http://localhost:5000/api/health'    // API health endpoint via blueprint
  ];

  for (const endpoint of healthEndpoints) {
    try {
      console.log(`Verifying Flask server via ${endpoint}...`);
      const response = await axios.get(endpoint, { timeout: 3000 });
      
      if (response.status === 200) {
        console.log('Flask server health check passed:', response.data);
        flaskStarted = true;
        return true;
      }
    } catch (error) {
      console.error(`Health check to ${endpoint} failed:`, error.message);
      // Continue to next endpoint
    }
  }
  
  return false;
}

function verifyBackendCommunication() {
  const testUrl = 'http://localhost:5000/api/test';
  console.log(`Verifying backend communication with ${testUrl}`);

  axios.get(testUrl)
    .then(response => {
      console.log('Backend communication successful:', response.data);
    })
    .catch(error => {
      console.error('Error communicating with backend:', error.message);
    });
}

app.on('ready', () => {
  startFlaskServer();
  createWindow();
  setTimeout(verifyBackendCommunication, 5000); // Delay to ensure server starts
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if (flaskProcess) {
      flaskProcess.kill();
    }
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
