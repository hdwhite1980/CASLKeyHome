// src/index.js
import { CASLVerification } from './components/CASLVerification.js';

// Export the component
export { CASLVerification };

// Create documentation for usage
console.log(`
CASL Key Verification Component v1.0.0

Usage:
1. Import the web component:
   <script type="module" src="path/to/casl-verification.js"></script>

2. Add the component to your HTML:
   <casl-verification></casl-verification>

3. Listen for verification complete event:
   document.querySelector('casl-verification').addEventListener('verificationComplete', (event) => {
     console.log('Verification completed:', event.detail);
   });
`);
