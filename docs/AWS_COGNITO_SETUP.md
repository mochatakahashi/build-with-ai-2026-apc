# AWS Cognito Setup Guide for CampusConnect

This guide provides step-by-step instructions for configuring **AWS Cognito User Pools** to enforce APC email domain restrictions, custom attributes, user groups, and connect to the React frontend.

---

## Prerequisites
1. An active **AWS Account**.
2. **AWS CLI** configured locally (optional, for CLI integrations).
3. **Node.js** installed on your workstation.

---

## Step 1: Create a Cognito User Pool

1. Log in to the **AWS Management Console**.
2. Navigate to the **Cognito** console.
3. Click **Create user pool**.
4. In **Configure sign-in experience**:
   * Select **Email** under Cognito User Pool sign-in options.
   * Click **Next**.
5. In **Configure security requirements**:
   * Choose your preferred password policy (Default: 8 characters, numbers, symbols, uppercase, lowercase).
   * Choose MFA settings: **No MFA** (recommended for testing/local dev) or **Require MFA**.
   * Select **Email** as the recovery method.
   * Click **Next**.
6. In **Configure sign-up experience**:
   * Ensure **Self-registration** is enabled.
   * Keep **Cognito to assist with verification...** checked. Select **Email** as the verification attribute.
   * Add **Custom Attributes** (Required for profile pages):
     * Click **Add custom attribute** -> Select **String** type. Name it `studentId`. Set min length `1`, max `256`. Make it **mutable**.
     * Click **Add custom attribute** -> Select **String** type. Name it `githubUsername`. Set min length `0`, max `256`. Make it **mutable**.
     * Click **Add custom attribute** -> Select **String** type. Name it `userType`. Set min length `1`, max `256`. Make it **mutable** (this stores `student` or `faculty`).
   * Click **Next**.
7. In **Configure message delivery**:
   * Select **Send email with Cognito** (for dev/sandbox limits) or configure **Amazon SES** (for production volume).
   * Click **Next**.
8. In **Integrate app**:
   * Enter a **User pool name** (e.g., `CampusConnectUserPool`).
   * Check **Use the Cognito Hosted UI** (optional).
   * Under **Initial app client**:
     * App client type: **Public client** (suitable for React SPAs).
     * App client name: `CampusConnectReactClient`.
     * Client secret: **Don't generate a client secret** (React cannot store secrets securely).
   * Click **Next**.
9. In **Review and create**:
   * Verify all configurations and click **Create user pool**.

---

## Step 2: Create Pre-Signup Lambda Trigger (Domain Enforcer)

To block sign-ups outside `@student.apc.edu.ph` and `@apc.edu.ph` and automatically assign `userType`, write a Pre-Signup trigger.

1. Navigate to the **AWS Lambda** console.
2. Click **Create function**:
   * Function name: `CampusConnectPreSignupEnforcer`.
   * Runtime: **Node.js 18.x** or **Node.js 20.x**.
   * Click **Create function**.
3. Replace the function editor code with the following:

```javascript
/**
 * AWS Lambda Pre-Signup Trigger
 * Enforces @student.apc.edu.ph and @apc.edu.ph domain registration limits.
 */
exports.handler = async (event) => {
  const email = event.request.userAttributes.email;
  
  if (!email) {
    throw new Error('Email attribute is missing.');
  }

  const domain = email.split('@')[1]?.toLowerCase();
  const allowedDomains = ['student.apc.edu.ph', 'apc.edu.ph'];

  if (!allowedDomains.includes(domain)) {
    throw new Error('Access Denied: Registration is restricted to APC emails only (@student.apc.edu.ph or @apc.edu.ph).');
  }

  // Determine userType
  let userType = 'student';
  if (domain === 'apc.edu.ph') {
    userType = 'faculty';
  }

  // Pre-populate userType custom attribute
  // Note: custom attributes must be prefixed with 'custom:'
  event.response.autoConfirmUser = false;
  event.response.autoVerifyEmail = false; 
  
  // We can write to user attributes before confirmation
  event.request.userAttributes['custom:userType'] = userType;

  return event;
};
```

4. Click **Deploy**.
5. **Link Lambda to Cognito**:
   * Return to your Cognito User Pool -> Go to the **User pool properties** tab.
   * Under **Lambda triggers**, click **Add Lambda trigger**.
   * Under **Trigger type**, select **Pre sign-up**.
   * Select the Lambda function `CampusConnectPreSignupEnforcer`.
   * Click **Save**.

---

## Step 3: Create Post-Confirmation Lambda Trigger (Group Assignment)

This trigger auto-assigns confirmed users to the `Members` group inside Cognito.

1. Create a new Lambda function: `CampusConnectPostConfirmationGroup`.
2. Select **Node.js** runtime and paste this code:

```javascript
const { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } = require("@aws-sdk/client-cognito-identity-provider");
const cognitoClient = new CognitoIdentityProviderClient({});

exports.handler = async (event) => {
  const userPoolId = event.userPoolId;
  const username = event.userName;
  const groupName = 'Members';

  try {
    const command = new AdminAddUserToGroupCommand({
      GroupName: groupName,
      UserPoolId: userPoolId,
      Username: username,
    });
    
    await cognitoClient.send(command);
    console.log(`Successfully added user ${username} to group ${groupName}`);
  } catch (error) {
    console.error(`Failed to add user ${username} to group:`, error);
  }

  return event;
};
```

3. **Deploy** the Lambda.
4. Go to the Lambda's **Configuration** tab -> **Permissions** -> Click the **Role name** to open IAM. Add a policy granting `cognito-idp:AdminAddUserToGroup` to the execution role.
5. In your Cognito User Pool, attach this Lambda to the **Post confirmation** trigger slot.

---

## Step 4: Create User Groups

In Cognito, create two user groups to support role mapping:
1. Navigate to the **User pool groups** section in your Cognito User Pool.
2. Click **Create group**:
   * Name: `Members`
   * Click **Create**.
3. Click **Create group** again:
   * Name: `Officers`
   * Click **Create**.

---

## Step 5: Connect React to AWS Cognito

Install AWS Amplify SDK inside the React project to interface with Cognito.

```bash
npm install aws-amplify
```

Configure Amplify inside `src/main.jsx` or a config file:

```javascript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-1_xxxxxxxxx', // Replace with your User Pool ID
      userPoolClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your Client ID
    }
  }
});
```

### Sign Up Example
```javascript
import { signUp } from 'aws-amplify/auth';

async function handleSignUp(email, password, fullName, studentId, githubUsername) {
  try {
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name: fullName,
          'custom:studentId': studentId,
          'custom:githubUsername': githubUsername || '',
        }
      }
    });
    console.log('Registration success. Verification email sent.');
  } catch (error) {
    console.error('Registration failed:', error);
  }
}
```

### Sign In Example
```javascript
import { signIn } from 'aws-amplify/auth';

async function handleSignIn(email, password) {
  try {
    const { isSignedIn, nextStep } = await signIn({ username: email, password });
    if (isSignedIn) {
      console.log('Logged in successfully!');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```
