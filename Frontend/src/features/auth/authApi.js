import axios from 'axios';

const authClient = axios.create({
  baseURL: '/api/auth',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 10000
});

export async function authenticate(credentials) {
  const response = await authClient.post('/login', {
    usernameOrEmail: credentials.usernameOrEmail.trim(),
    password: credentials.password
  });

  if (typeof response.data?.token !== 'string' || !response.data.token) {
    throw new Error('The authentication response did not contain an access token.');
  }

  return response.data.token;
}

export async function registerPatient(patient) {
  const response = await authClient.post('/register', {
    username: patient.username.trim(),
    email: patient.email.trim().toLowerCase(),
    password: patient.password
  });

  return response.data;
}

export async function renewSession() {
  const response = await authClient.post('/refresh');
  if (typeof response.data?.token !== 'string' || !response.data.token) {
    throw new Error('The renewal response did not contain an access token.');
  }
  return response.data.token;
}

export async function endSession() {
  await authClient.post('/logout');
}
