// src/index.js
import { CASLVerification } from './components/CASLVerification.js';
import { Authentication } from './components/Authentication.js';
import { UserDashboard } from './components/UserDashboard.js';
import { CASLApp } from './components/CASLApp.js';

// Export all components
export { 
  CASLVerification,
  Authentication,
  UserDashboard,
  CASLApp
};

// Create documentation for usage
console.log(`
CASL Key Verification System v1.0.0

Usage Options:

1. Use all-in-one app component:
   <casl-app></casl-app>
   
   This component includes authentication, dashboard, and verification all in one.

2. Use individual components:

   a. For authentication alone:
      <casl-authentication></casl-authentication>
   
   b. For the user dashboard:
      <casl-user-dashboard></casl-user-dashboard>
   
   c. For the verification process:
      <casl-verification></casl-verification>

3. Listen for events:
   
   a. Authentication events:
      document.querySelector('casl-authentication').addEventListener('casl-auth', (event) => {
        console.log('Auth event:', event.detail);
      });
   
   b. Dashboard events:
      document.querySelector('casl-user-dashboard').addEventListener('casl-dashboard', (event) => {
        console.log('Dashboard event:', event.detail);
      });
   
   c. Verification events:
      document.querySelector('casl-verification').addEventListener('verificationComplete', (event) => {
        console.log('Verification completed:', event.detail);
      });
`);
