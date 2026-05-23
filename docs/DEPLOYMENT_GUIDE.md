# CampusConnect AWS Deployment Guide

This guide details the step-by-step process of deploying the **CampusConnect** infrastructure to AWS, covering DynamoDB, S3 CORS configurations, Lambda compute, API Gateway integrations, and frontend deployment.

---

## 1. Prerequisites
* **AWS CLI** installed and authenticated. Run `aws configure` to verify credentials.
* **Node.js** (v18+) and **npm** installed on your development workstation.
* Git repository containing the React frontend.

---

## 2. S3 Bucket Setup (Image Storage)

User avatars and post attachments are stored in an S3 Bucket. To protect copyright, images are watermarked client-side prior to upload.

1. Create a bucket:
   ```bash
   aws s3api create-bucket --bucket campusconnect-images --region ap-southeast-1 --create-bucket-configuration LocationConstraint=ap-southeast-1
   ```
2. Enable public read access on bucket objects (or integrate with CloudFront OAC for enhanced security):
   * In the AWS S3 Console, disable **Block public access (bucket settings)**.
3. Configure **CORS (Cross-Origin Resource Sharing)** to allow uploads from your React app domain (e.g., localhost during development):
   * Save the following JSON as `cors.json`:
     ```json
     [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
         "AllowedOrigins": ["*"],
         "ExposeHeaders": ["ETag"]
       }
     ]
     ```
   * Apply configuration:
     ```bash
     aws s3api put-bucket-cors --bucket campusconnect-images --cors-configuration file://cors.json
     ```

---

## 3. Create DynamoDB Tables

Run the following commands to create the DynamoDB tables outlined in the architectural design.

### Users Table
```bash
aws dynamodb create-table \
    --table-name cc_users \
    --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=email,AttributeType=S \
    --key-schema AttributeName=userId,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --global-secondary-indexes "[{\"IndexName\":\"EmailIndex\",\"KeySchema\":[{\"AttributeName\":\"email\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]"
```

### Posts Table
```bash
aws dynamodb create-table \
    --table-name cc_posts \
    --attribute-definitions AttributeName=postId,AttributeType=S AttributeName=createdAt,AttributeType=S \
    --key-schema AttributeName=postId,KeyType=HASH AttributeName=createdAt,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### Events Table
```bash
aws dynamodb create-table \
    --table-name cc_events \
    --attribute-definitions AttributeName=eventId,AttributeType=S AttributeName=date,AttributeType=S \
    --key-schema AttributeName=eventId,KeyType=HASH AttributeName=date,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### Organizations Table
```bash
aws dynamodb create-table \
    --table-name cc_organizations \
    --attribute-definitions AttributeName=orgId,AttributeType=S \
    --key-schema AttributeName=orgId,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### Attendance Table
```bash
aws dynamodb create-table \
    --table-name cc_attendance \
    --attribute-definitions AttributeName=eventId,AttributeType=S AttributeName=studentId,AttributeType=S \
    --key-schema AttributeName=eventId,KeyType=HASH AttributeName=studentId,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

---

## 4. Lambda Backend Compute

Deploy Lambda functions containing the business logic.

1. **Write Handler Code**: A sample Lambda handler for reading posts (`cc-get-posts`) using the AWS SDK client:
   ```javascript
   const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
   const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

   const client = new DynamoDBClient({});
   const docClient = DynamoDBDocumentClient.from(client);

   exports.handler = async (event) => {
     try {
       const category = event.queryStringParameters?.category;
       let scanParams = { TableName: "cc_posts" };
       
       if (category && category !== 'all') {
         scanParams.FilterExpression = "category = :cat";
         scanParams.ExpressionAttributeValues = { ":cat": category };
       }

       const command = new ScanCommand(scanParams);
       const data = await docClient.send(command);
       
       return {
         statusCode: 200,
         headers: {
           "Content-Type": "application/json",
           "Access-Control-Allow-Origin": "*"
         },
         body: JSON.stringify(data.Items)
       };
     } catch (error) {
       return {
         statusCode: 500,
         body: JSON.stringify({ error: error.message })
       };
     }
   };
   ```
2. **Deploy Function**:
   * Zip the files: `zip function.zip index.js`
   * Create execution role and run:
     ```bash
     aws lambda create-function \
         --function-name cc-get-posts \
         --runtime nodejs18.x \
         --role arn:aws:iam::123456789012:role/cc-lambda-execution-role \
         --handler index.handler \
         --zip-file fileb://function.zip
     ```

---

## 5. Configure API Gateway

Deploy an **HTTP API** using Amazon API Gateway to expose Lambdas securely, attaching Cognito validation.

1. Create the API:
   ```bash
   aws apigatewayv2 create-api --name CampusConnectAPI --protocol-type HTTP
   ```
2. **Create Cognito Authorizer**:
   * Attach your Cognito User Pool as the JWT issuer to automatically authorize requests.
3. **Integrate Routes**:
   * Connect routes like `GET /posts` to `cc-get-posts` Lambda using `aws apigatewayv2 create-integration`.

---

## 6. Frontend Deployment (AWS Amplify Hosting)

Amplify Hosting connects directly to your Git repository (GitHub/GitLab) and sets up a continuous deployment pipeline for the React app.

1. Go to **AWS Amplify** console.
2. Click **New app** -> **Host web app**.
3. Authenticate with your Git provider and select the `build-with-ai-2026-apc` repository and branch.
4. **Configure Build Settings**:
   * Under App build settings, Amplify auto-detects Vite configuration. Modify the `frontend` build commands if needed:
     ```yaml
     version: 1
     frontend:
       phases:
         preBuild:
           commands:
             - npm ci
         build:
           commands:
             - npm run build
       artifacts:
         baseDirectory: dist
         files:
           - '**/*'
       cache:
         paths:
           - node_modules/**/*
     ```
5. **Configure Environment Variables**:
   * In Amplify, add the following variables:
     * `VITE_COGNITO_USER_POOL_ID`
     * `VITE_COGNITO_CLIENT_ID`
     * `VITE_API_BASE_URL`
     * `VITE_S3_BUCKET_NAME`
6. Click **Save and Deploy**.
7. Amplify will deploy the React application on a custom URL (e.g. `https://master.xxxx.amplifyapp.com`). You can bind a custom domain using SSL certificates automatically managed by AWS Route 53.

---

## 7. Cost Estimation (Free Tier Optimized)

This stack is built using Serverless resources that fall within the **AWS Free Tier**:
* **AWS Cognito**: First 50,000 Monthly Active Users (MAUs) are completely free.
* **AWS Lambda**: 1 million free requests per month.
* **AWS DynamoDB**: 25 GB of storage and 25 Write/Read capacity units (WCU/RCU) free.
* **AWS S3**: 5 GB of standard storage free.
* **AWS API Gateway**: 1 million HTTP requests free.
* **AWS Amplify**: 1000 build minutes/month free.
