# CampusConnect — Technical Documentation

## 1. Project Summary
**CampusConnect** is a campus-exclusive social media platform designed specifically for students and faculty of Asia Pacific College (APC). The platform restricts sign-up/login to institutional email domains, establishing a secure environment for campus discourse, event organization, project collaborations, and organization directory management.

### Key Objectives
* **Exclusivity**: Limit access to users with verified `@student.apc.edu.ph` (students) or `@apc.edu.ph` (faculty) email addresses.
* **Collaboration**: Showcase student projects, campus news, and local gathering spots.
* **Event Attendance**: Provide secure, tokenized QR-code verification for tracking attendance at campus events.
* **Role-Based Access Control (RBAC)**: Offer organizations a way to designate Members and Officers, enabling Officers to run meetings, manage members, and post events.

---

## 2. System Architecture
CampusConnect is designed using a **Serverless Architecture** to minimize costs, automatically scale, and reduce infrastructure management overhead.

```
+------------------+     Cognito JWT     +-------------------+
|                  | ------------------> |    AWS Cognito    |
|   React + Vite   |                     +-------------------+
|  (Hosted on S3/  |                               ^
|   Amplify CDN)   |     REST HTTP         | Cognito User Groups
|                  | ------------------> +-------------------+
+------------------+                     |   AWS API Gateway |
         |                               +-------------------+
         | Pre-signed URLs                         |
         v                                         v
+------------------+                     +-------------------+
|    AWS S3        | <------------------ |   AWS Lambda      |
|  (Image Bucket)  |                     +-------------------+
+------------------+                               |
                                                   v
                                         +-------------------+
                                         |   AWS DynamoDB    |
                                         +-------------------+
```

### Components
1. **Frontend**: React 19 application built with Vite, styled with vanilla CSS (leveraging a centralized CSS variables design system), and using Lucide icons.
2. **Identity Provider**: AWS Cognito User Pool with Pre-Signup Lambda triggers to enforce domain restrictions, and Custom User Attributes (`studentId`, `githubUsername`, `userType`).
3. **API Gateway**: Amazon API Gateway routing REST endpoints to lambda handlers, using a Cognito Authorizer for JWT validation.
4. **Backend Compute**: AWS Lambda functions running Node.js handlers for business logic.
5. **Database**: Amazon DynamoDB, structured using Single-Table Design patterns.
6. **File Storage**: Amazon S3 for storing user-submitted images, utilizing client-side Canvas watermarking before uploads.

---

## 3. Data Models (DynamoDB Table Schemas)

CampusConnect uses a Single-Table Design or dedicated NoSQL schemas. Below are the table definitions modeled for DynamoDB:

### Users Table
* **Table Name**: `cc_users`
* **Primary Key**: `userId` (Hash)

| Attribute | Type | Key | Description |
|---|---|---|---|
| **userId** | String | Partition Key | Unique user identifier (e.g. `user-123`) |
| **email** | String | GSI-1 PK | User's APC email address |
| **displayName** | String | - | User's full name |
| **studentId** | String | GSI-2 PK | APC student/employee ID (e.g., `2022-100456`) |
| **githubUsername**| String | - | Optional linked GitHub handle |
| **avatarUrl** | String | - | URL of profile image |
| **bio** | String | - | Short biography |
| **friends** | List[String]| - | List of userIds representing friends |
| **organizations** | List[String]| - | List of orgIds the user belongs to |
| **userType** | String | - | `student` or `faculty` |
| **createdAt** | String | - | ISO 8601 creation timestamp |

### Posts Table
* **Table Name**: `cc_posts`
* **Primary Key**: `postId` (Hash)

| Attribute | Type | Key | Description |
|---|---|---|---|
| **postId** | String | Partition Key | Unique post identifier |
| **authorId** | String | GSI-1 PK | Author's `userId` |
| **category** | String | GSI-2 PK | `news` \| `projects` \| `gathering-spots` |
| **content** | String | - | Post content text |
| **imageUrl** | String | - | Optional watermarked image URL |
| **likes** | List[String]| - | Array of userIds who liked the post |
| **comments** | List[Object]| - | Array of comments: `{ id, authorId, authorName, authorAvatar, text, createdAt }` |
| **createdAt** | String | Sort Key | ISO 8601 timestamp |

### Events Table
* **Table Name**: `cc_events`
* **Primary Key**: `eventId` (Hash)

| Attribute | Type | Key | Description |
|---|---|---|---|
| **eventId** | String | Partition Key | Unique event identifier |
| **organizerId** | String | GSI-1 PK | Organizer's `userId` or `orgId` |
| **title** | String | - | Event title |
| **description** | String | - | Description of the event |
| **date** | String | Sort Key | Event date (YYYY-MM-DD) |
| **time** | String | - | Event start time (HH:MM) |
| **location** | String | - | Physical room or online link |
| **tag** | String | GSI-2 PK | `students-only` \| `externals-allowed` |
| **attendees** | List[String]| - | Array of userIds who RSVP'd |
| **coverImageUrl** | String | - | Banner image URL |
| **createdAt** | String | - | ISO 8601 timestamp |

### Organizations Table
* **Table Name**: `cc_organizations`
* **Primary Key**: `orgId` (Hash)

| Attribute | Type | Key | Description |
|---|---|---|---|
| **orgId** | String | Partition Key | Unique organization identifier |
| **name** | String | - | Organization name |
| **description** | String | - | Description of scope/mission |
| **category** | String | GSI-1 PK | `academic` \| `technology` \| `sports` \| `cultural` \| `social` |
| **logoUrl** | String | - | Logo image location |
| **members** | Map[String, String] | - | Key-value store mapping `userId` to role (`officer` \| `member`) |
| **createdAt** | String | - | ISO 8601 timestamp |

### Attendance Table
* **Table Name**: `cc_attendance`
* **Primary Key**: `eventId` (Hash) + `studentId` (Range)

| Attribute | Type | Key | Description |
|---|---|---|---|
| **eventId** | String | Partition Key | Event identifier |
| **studentId** | String | Sort Key | Attending user's ID |
| **studentName** | String | - | Attending user's display name |
| **timestamp** | String | - | Verification timestamp |
| **verifiedBy** | String | - | Verifying officer's `userId` |

---

## 4. API Endpoints Specification

All endpoints are hosted behind Amazon API Gateway and require a Cognito Bearer token in the `Authorization` header, except where noted.

### Auth Endpoints
* `POST /auth/register` (Public)
  * Request: `{ email, password, displayName, studentId, githubUsername }`
  * Response: `{ userToken, user: { id, email, displayName, studentId, githubUsername, userType } }`
* `POST /auth/login` (Public)
  * Request: `{ email, password }`
  * Response: `{ userToken, user }`

### Users Endpoints
* `GET /users/:id`
  * Response: `{ id, displayName, email, studentId, githubUsername, bio, userType, friends: [...] }`
* `PUT /users/:id`
  * Request: `{ displayName, bio, githubUsername }`
  * Response: `{ id, displayName, bio, githubUsername, ... }`
* `POST /users/:id/friends`
  * Request: `{ targetUserId, action: "add" | "remove" }`
  * Response: `{ success: true }`

### Feed Endpoints
* `GET /posts?category=news`
  * Response: `[ { postId, authorId, authorName, authorAvatar, content, category, imageUrl, likes, comments, createdAt } ]`
* `POST /posts`
  * Request: `{ content, category, imageUrl }`
  * Response: `{ postId, content, category, imageUrl, ... }`
* `DELETE /posts/:id`
  * Response: `{ success: true }`
* `POST /posts/:id/like`
  * Response: `{ likes: [...] }`
* `POST /posts/:id/comments`
  * Request: `{ text }`
  * Response: `{ commentId, authorName, text, createdAt }`

### Events Endpoints
* `GET /events?tag=students-only`
  * Response: `[ { eventId, title, description, date, time, location, tag, attendees, coverImageUrl } ]`
* `POST /events`
  * Request: `{ title, description, date, time, location, tag, coverImageUrl }`
  * Response: `{ eventId, title, ... }`
* `POST /events/:id/rsvp`
  * Response: `{ attendees: [...] }`

### Attendance Endpoints
* `GET /events/:id/attendance` (Officers only)
  * Response: `[ { id, studentId, studentName, timestamp, verifiedBy } ]`
* `POST /events/:id/attendance` (Officers only)
  * Request: `{ qrTokenString }`
  * Response: `{ success: true, record: { studentName, studentId, timestamp } }`

### Organizations Endpoints
* `GET /organizations?category=technology`
  * Response: `[ { orgId, name, description, category, logoUrl, members } ]`
* `POST /organizations/:id/join`
  * Response: `{ members }`
* `POST /organizations/:id/leave`
  * Response: `{ members }`
* `POST /organizations/:id/roles` (Officers only)
  * Request: `{ targetUserId, action: "promote" | "demote" | "remove" }`
  * Response: `{ members }`

---

## 5. Key User Flows

### A. Student Joining an Organization & Promotion
1. **Join request**: Student clicks "Join Club" on [OrgCard](file:///c:/Users/Rodmina%20Jhoy%20Ibe/Downloads/skills-based-app-main/build-with-ai-2026-apc/src/components/OrgCard.jsx).
2. **Service invocation**: React calls `joinOrg(orgId, userId)` inside [OrgContext](file:///c:/Users/Rodmina%20Jhoy%20Ibe/Downloads/skills-based-app-main/build-with-ai-2026-apc/src/contexts/OrgContext.jsx) which triggers `orgService.joinOrganization`.
3. **Database update**: The user's role mapping is added to the organization's members attribute: `members: { [userId]: 'member' }`.
4. **Promotion (RBAC)**: An existing officer accesses the Officer Panel, clicks "Promote", invoking `promoteToOfficer(orgId, officerId, memberId)`.
5. **Database update**: Target user's role transitions from `'member'` to `'officer'`.

### B. QR Code Attendance Verification Flow
```
[Student Device]                        [Organizer Device]
       |                                         |
       |  1. Request Attendance QR                |
       |  (JSON payload + 30s token)             |
       v                                         |
[Generates QR code]                              |
       |                                         |
       | ------> 2. Shows QR code -------------> |
       |                                         v
       |                                  [Scan/Paste QR Data]
       |                                         |
       |                                  3. Parse JSON & check event
       |                                  4. Validate token < 60s
       |                                  5. Check for double registration
       |                                         v
       |                                  [Token is valid]
       |                                         |
       | <----- 6. Record Present -------------- |
       v                                         v
[Success notification]                     [Saves record]
```

1. **Attendee QR Request**: The attendee clicks "My Attendance QR". The [QRCodeGenerator](file:///c:/Users/Rodmina%20Jhoy%20Ibe/Downloads/skills-based-app-main/build-with-ai-2026-apc/src/components/QRCodeGenerator.jsx) compiles a JSON payload:
   ```json
   {
     "studentId": "user-123",
     "eventId": "event-456",
     "timestamp": "2026-05-23T13:25:00Z",
     "token": "4a6f9c2d"
   }
   ```
2. **Token Cycle**: The payload changes every 30 seconds to prevent replay attacks.
3. **Scanning**: The event officer opens [QRCodeScanner](file:///c:/Users/Rodmina%20Jhoy%20Ibe/Downloads/skills-based-app-main/build-with-ai-2026-apc/src/components/QRCodeScanner.jsx) and scans the code.
4. **Validation**: The system calls `parseQRData` and `isTokenValid(timestamp)`.
   * Expired tokens (> 60s since generation) or incorrect eventIds are rejected.
5. **Confirmation**: If valid, the scanner renders student name, image, and ID.
6. **Persistence**: The officer confirms, calling `attendanceService.recordAttendance`. The attendee is logged.

---

## 6. Security Architecture

1. **Sign-up Enforcements**: Custom pre-signup triggers in AWS Cognito inspect user emails. Sign-ups containing domains other than `@student.apc.edu.ph` or `@apc.edu.ph` are rejected.
2. **Access Control (RBAC)**: Page-level buttons (e.g. "Officer Panel", "Scan Attendance") check membership maps (`members[userId] === 'officer'`) before rendering. APIs verify caller attributes on the backend before writing tables.
3. **Replay Protection**: Attendees cannot share screenshots of QR codes, because QR payloads expire after 60 seconds.
4. **IP & Asset Safety**: User artwork is watermarked before uploading to public CDN. The frontend draws copyright patterns on a Canvas element, rendering a watermarked Blob file for transfer.
