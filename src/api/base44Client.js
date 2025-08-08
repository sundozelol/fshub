import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "687ce0af105ab6c69e13ab8d", 
  requiresAuth: true // Ensure authentication is required for all operations
});
