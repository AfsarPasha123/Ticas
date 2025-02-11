import axios from 'axios';
import http from 'http';

async function testAuthentication() {
  const BASE_URL = 'http://localhost:3000';

  console.log('🔍 Starting Authentication Tests');
  console.log('-----------------------------');

  // Test Server Connectivity
  console.log('\n📋 Test 0: Server Connectivity');
  try {
    await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        method: 'GET',
        path: '/'
      }, (res) => {
        console.log('✅ Server is reachable');
        resolve();
      });

      req.on('error', (error) => {
        console.error('❌ Server is not reachable');
        console.error('Error Details:', error.message);
        reject(error);
      });

      req.setTimeout(5000, () => {
        console.error('❌ Server connection timed out');
        req.abort();
        reject(new Error('Connection timeout'));
      });

      req.end();
    });
  } catch (error) {
    console.error('Cannot proceed with tests. Server not accessible.');
    return;
  }

  // Test Case 1: Successful Login
  try {
    console.log('\n📋 Test 1: Successful Login');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: '12345@gmail.com',
      password: '12345'
    }, {
      // Add timeout and detailed error handling
      timeout: 10000,
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Reject only if status is 500 or above
      }
    });

    console.log('Login Response Status:', loginResponse.status);
    console.log('Response Data:', loginResponse.data);

    if (loginResponse.status !== 200) {
      console.error('❌ Login Failed');
      console.error('Response Details:', loginResponse.data);
      return;
    }

    console.log('✅ Login Successful');
    console.log('User ID:', loginResponse.data.user_id);
    console.log('Token Exists:', !!loginResponse.data.token);

    // Test Case 2: Token Validation
    console.log('\n📋 Test 2: Token Validation');
    const token = loginResponse.data.token;
    
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Profile Fetch Successful');
    console.log('Profile Details:', profileResponse.data);

  } catch (error) {
    console.error('❌ Authentication Test Failed');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received');
      console.error('Request Configuration:', error.config);
    } else {
      // Something happened in setting up the request
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
    }
  }
}

// Run the tests
testAuthentication().catch(console.error);
