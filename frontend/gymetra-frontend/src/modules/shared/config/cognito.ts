import { Amplify } from 'aws-amplify';

const env = (import.meta as any).env || {};
const cognitoRegion = env.VITE_COGNITO_REGION || 'us-east-2';
const cognitoUserPoolId = env.VITE_COGNITO_USER_POOL_ID || '';
const cognitoUserPoolClientId = env.VITE_COGNITO_CLIENT_ID || '';

export const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: cognitoUserPoolId,
      userPoolClientId: cognitoUserPoolClientId,
      signUpVerificationMethod: 'code' as const,
    }
  }
};

export const configureAmplify = () => {
  Amplify.configure(cognitoConfig);
};

