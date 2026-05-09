import { Amplify } from 'aws-amplify';
export const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-2_ckSy7zPAt',
      userPoolClientId: '3gnvfec5v6tfp32u634mq645ll',
      signUpVerificationMethod: 'code',
    }
  }
};
export const configureAmplify = () => {
  Amplify.configure(cognitoConfig);
  console.log('🛡️ Amplify configurado con éxito');
};

