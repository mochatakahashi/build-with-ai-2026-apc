# 🎓 CampusConnect

CampusConnect is a full-featured, campus-exclusive social media platform designed for students and faculty of Asia Pacific College (APC). The application restricts access to verified institutional email addresses and provides social features tailored to enhance campus life.

---

## 🚀 Key Features

* 🔐 **School Domain Restrictive Auth**: Restricts registration exclusively to `@student.apc.edu.ph` (students) or `@apc.edu.ph` (faculty) email accounts.
* 👥 **User Profiles & Friends**: Link your GitHub account, display campus stats, and add/remove peers on friend lists.
* 📰 **Main Feed**: Categorized streams for news, student projects, and local gathering spots with likes and comment threads.
* 📅 **Event management**: Post events and designate access tags ("Students Only" vs. "Externals Allowed") with RSVP tracking.
* 🏫 **Clubs Directory**: Reusable cards for discovering organizations, with joins/leaves and custom role promotion (Officers vs. Members).
* 🖼️ **Client-Side Image Watermarking**: Applies a semi-transparent diagonal "© CampusConnect" watermark pattern on user artwork prior to upload to S3, protecting copyright.
* 🎫 **QR Code Attendance System**: Event attendees present a secure, 30-second rotating QR code. Event organizers scan the code via a viewfinder to instantly record verified attendance.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite, React Router v7, Lucide React
* **Styling**: Vanilla CSS (Premium Glassmorphic Design System with HSL colors and slide animations)
* **Backend (AWS Production ready)**: AWS Cognito, DynamoDB, S3, API Gateway, AWS Lambdas, CloudFront CDN, Amplify Hosting

---

## 📂 Project Structure

```
build-with-ai-2026-apc/
├── docs/                           # Technical documentation
│   ├── TECHNICAL_DOCS.md           # Architecture, API specifications, and flows
│   ├── AWS_COGNITO_SETUP.md        # Cognito User Pool & Lambda trigger setup
│   └── DEPLOYMENT_GUIDE.md         # CLI instructions for S3, DynamoDB, Amplify
│
├── public/                         # Public assets
│   ├── favicon.svg                 # App icon
│   └── index.html                  # HTML entry template
│
├── src/                            # Source code
│   ├── main.jsx                    # App entry point
│   ├── App.jsx                     # Route definitions and shells
│   ├── index.css                   # Global styles & design system tokens
│   │
│   ├── components/                 # Reusable UI elements
│   │   ├── Navbar.jsx / .css       # Premium navigation shell
│   │   ├── PostCard.jsx / .css     # Main feed card
│   │   ├── EventCard.jsx / .css    # Event listing card
│   │   ├── OrgCard.jsx / .css      # Org directory card
│   │   ├── ProfileCard.jsx / .css  # Friends stack card
│   │   ├── QRCodeGenerator.jsx     # Attendance QR code generator
│   │   ├── QRCodeScanner.jsx       # Attendance QR code scanner simulator
│   │   ├── QRCode.css              # Combined QR component styles
│   │   ├── ImageUploader.jsx/.css  # File upload dropzone with previews
│   │   ├── Modal.jsx / .css        # Portal-rendered glass dialogs
│   │   ├── SearchBar.jsx / .css    # Icon inputs with clear actions
│   │   └── Toast.jsx / .css        # Array-based toast alert stacks
│   │
│   ├── pages/                      # Page-level components
│   │   ├── LoginPage.jsx / .css    # Sign-in with domain enforcers
│   │   ├── RegisterPage.jsx / .css # Custom sign-ups with strength meters
│   │   ├── FeedPage.jsx / .css     # Category feeds & write forms
│   │   ├── ProfilePage.jsx / .css  # Profile banners, sidebars, and details
│   │   ├── EventsPage.jsx / .css   # Events grid and event creation
│   │   ├── EventDetailPage.jsx/.css# Cover image headers, RSVPs, logs
│   │   ├── OrganizationsPage.jsx/.css# Searchable org directory
│   │   ├── OrgDetailPage.jsx / .css# Org profiles & officer panels
│   │   └── NotFoundPage.jsx / .css # Custom centering 404 pages
│   │
│   ├── contexts/                   # React Context global state providers
│   │   ├── AuthContext.jsx         # User login/register sessions
│   │   ├── FeedContext.jsx         # Posts, comments, likes records
│   │   ├── EventContext.jsx        # Events, RSVPs, cancellations
│   │   └── OrgContext.jsx          # Club joins, promotion actions
│   │
│   ├── services/                   # Backend services (Mock AWS localStorage)
│   │   ├── authService.js          # Mock Cognito session storage
│   │   ├── userService.js          # Mock User profiles
│   │   ├── feedService.js          # Mock Feed updates
│   │   ├── eventService.js         # Mock Events actions
│   │   ├── attendanceService.js    # Mock Attendance logs
│   │   └── imageService.js         # Mock S3 uploading
│   │
│   ├── utils/                      # Helper methods
│   │   ├── watermark.js            # HTML5 Canvas image watermark drawer
│   │   ├── qrHelpers.js            # JSON token QR encoders/decoders
│   │   ├── validators.js           # Email domain and password checks
│   │   └── formatters.js           # Relative dates, counts, and initials
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useLocalStorage.js      # Synced localStorage state hooks
│   │   ├── useAuth.js              # Short-cut Auth contexts hooks
│   │   └── useToast.js             # Short-cut Toast notifications hooks
│   │
│   └── data/                       # Initial data layers
│       ├── mockUsers.js            # Default students & faculty list
│       ├── mockPosts.js            # Default categorised post streams
│       ├── mockEvents.js           # Default upcoming campus events
│       └── mockOrgs.js             # Default campus clubs
│
├── package.json                    # Dependencies listing
├── vite.config.js                  # Vite configuration settings
└── .env.example                    # Sample environment keys
```

---

## 🏁 Quick Start

### 1. Clone the project and navigate to the directory
```bash
cd build-with-ai-2026-apc
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run application locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🔐 Demo Credentials

To test the application flows instantly, use the following pre-registered credentials:
* **Email**: `admin@student.apc.edu.ph`
* **Password**: `demo123`

This account behaves as a student user (`Juan Dela Cruz`) who is an officer in the **Computer Science Society** and the **Google Developer Student Club**, allowing you to preview both Student features and Officer Management Panels.

---

## 🛠️ AWS Production Deployment

To take this application live on real cloud servers, consult our detailed instructions:
1. Setup your domain checking lambdas and groups in [Cognito User Pools Guide](docs/AWS_COGNITO_SETUP.md).
2. Configure DynamoDB schemas, S3 CORS policies, and deploy using [Amplify Deployment Guide](docs/DEPLOYMENT_GUIDE.md).

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Alternate Short README (provided)

# Campus Connect 

## Project Overview
A private, exclusive social network designed specifically for enrolled students. This platform allows students to share projects, discover campus organizations, post artworks securely, and track event attendance. 

## Current Progress Status
* [x] Project Idea & Scope Defined
* [x] Core Features Identified
* [x] Role-Based Access Control (RBAC) Planned
* [x] Event Attendance Logic Outlined
* [x] UI/UX Inspiration Gathered 
* [ ] Frontend Development (Pending)
* [ ] AWS Backend Setup (Pending)

## Core Features
1. **Exclusive Access:** Strict login system requiring a valid student email domain. Externals cannot access the core platform.
2. **Student Profiles:** Users can set up profiles, add friends, and link their GitHub repositories.
3. **Campus Feed:** A main dashboard for sharing news, projects, and local gathering spots.
4. **Art Hub with Watermarking:** A secure space for students to share artworks. The system automatically applies a custom watermark to all image uploads to prevent copyright theft.
5. **Organization Directory & Roles:** A dedicated page to browse campus orgs. Students can join and be assigned roles like "Member" or "Officer." Officers have elevated privileges to manage their org pages.
6. **Smart Event Board & Attendance:** An announcement hub where events are tagged as "Students Only" or "Externals Allowed." Features a built-in attendance tracker using QR codes or PINs to log student participation directly into their profiles.

## Proposed Tech Stack
* **Frontend:** React (Optimized for both mobile and desktop views)
* **Backend Cloud Architecture:** AWS
	* **Authentication:** AWS Cognito (For secure student email login and RBAC management)
	* **Database:** Amazon DynamoDB (For fast retrieval of user profiles, feeds, and attendance logs)
	* **Storage:** Amazon S3 (For storing user profile pictures and artwork uploads)

## Developer Notes
The design will take inspiration from the official school website but will be modernized. It will feature a responsive, mobile-friendly layout with card-based feeds and a clean color scheme.

________


