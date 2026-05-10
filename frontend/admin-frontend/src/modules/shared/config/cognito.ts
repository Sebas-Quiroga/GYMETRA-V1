// src/config/cognito.ts
import { Amplify } from 'aws-amplify';

const env = (import.meta as any).env || {};
const cognitoRegion = env.VITE_COGNITO_REGION || 'us-east-2';
const cognitoUserPoolId = env.VITE_COGNITO_USER_POOL_ID || '';
const cognitoUserPoolClientId = env.VITE_COGNITO_CLIENT_ID || '';

export const cognitoConfig = {
  Auth: {
    region: cognitoRegion,
    userPoolId: cognitoUserPoolId,
    userPoolWebClientId: cognitoUserPoolClientId,
    Cognito: {
      userPoolId: cognitoUserPoolId,
      userPoolClientId: cognitoUserPoolClientId,
    }
  }
};

export const configureAmplify = () => {
  Amplify.configure(cognitoConfig);
  console.log('🛡️ Amplify configurado para Admin con éxito');
};
