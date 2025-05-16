// Simple script to test API connection
import axios from 'axios';

async function testApiConnection() {
  console.log('Testing API connection to Flask backend...');
  
  // Define all possible endpoints to test
  const endpoints = [
    { name: 'Root', url: 'http://localhost:5000/' },
    { name: 'Health', url: 'http://localhost:5000/health' },
    { name: 'API Health', url: 'http://localhost:5000/api/health' },
    { name: 'API Test', url: 'http://localhost:5000/api/test' }
  ];
  
  // Try each endpoint
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name} endpoint: ${endpoint.url}`);
      const response = await axios.get(endpoint.url);
      console.log(`${endpoint.name} response (${response.status}):`, response.data);
    } catch (error) {
      console.error(`${endpoint.name} connection failed:`, error.message);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received. Server might not be running.');
      }
    }
  }
}

testApiConnection();