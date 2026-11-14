# CampusDesk — university IT help desk

A responsive frontend prototype built with React, Vite, Tailwind CSS, React Router, JavaScript, and Lucide React. No backend or AWS services are configured.

## Run locally

Install Node.js 20.19+ or 22.12+ (LTS recommended), then open a terminal in this folder:

```sh
npm install
npm run dev
```

Open the local address printed by Vite, usually http://localhost:5173. Choose Student or IT support staff on the login page. Enter your name, any valid university email address (including a numeric student ID), and a password of at least six characters.

**Authentication is mock authentication.** Passwords are not saved or sent anywhere. Role selection and frontend route checks provide no real security. The entered name is used for the profile, greeting, new tickets, and replies. All student demo sign-ins share one sample ticket workspace; entering a name and email does not create an account. Existing sample tickets retain their original author names.

## Try the prototype

1. Sign in as Student, create a ticket, and optionally select attachments.
2. Search and filter My tickets. Open your new ticket and add a reply.
3. Sign out and sign in as IT support staff.
4. Open the ticket, assign a team member, change its priority and status, and reply. Each change appears in the timeline.
5. Sign back in as Student to see the updates.

Tickets persist in localStorage in this browser. The demo session uses sessionStorage. Attachments save names and sizes only; file contents are not uploaded or persisted. Clear the `campusdesk-tickets-v1` localStorage key in browser developer tools to restore sample tickets. Storage failures show feedback rather than silently replacing data.

## Check and build

```sh
npm test
npm run build
npm run preview
```

`dist/` contains static production files. The hash router allows page navigation on static hosting without server rewrite rules. No deployment has been performed.

## Project structure

- `src/components/UI.jsx`: buttons, badges, cards, table, dialog, empty state.
- `src/layouts/Layout.jsx`: responsive navigation, header, help dialog, notifications.
- `src/pages/`: login, student/staff dashboard, ticket list, creation, and details.
- `src/hooks/useTickets.jsx`: shared ticket state, loading, errors, notifications.
- `src/services/ticketService.js`: asynchronous ticket API boundary and demo persistence.
- `src/data/mockData.js`: sample tickets, staff members, and student profile.
- `src/styles/index.css`: Tailwind import and shared responsive styles.

## Future AWS integration

1. Copy `.env.example` to `.env` and set `VITE_API_URL` to your team's API Gateway URL. Environment variables prefixed `VITE_` are public browser configuration, never secrets.
2. Replace `list`, `create`, `update`, and `reply` in `src/services/ticketService.js` with authenticated `fetch` calls. API_URL is already exported there. Keep the method signatures or adapt `useTickets.jsx` to your team's response format.
3. Replace the mock session handling in `src/App.jsx` and demo login in `src/pages/Login.jsx` with your team's Cognito sign-in flow and verified profile. Supply real user IDs and roles. Enforce authorization on the backend for every operation; browser role checks are only presentation.
4. Replace mock staff/profile data in `src/data/mockData.js` with API-provided people. Preserve ticket fields: id, title, description, category, priority, status, createdAt, studentId, studentName, assignedTo, attachments, replies, activity.
5. Implement your team's upload flow in `CreateTicket.jsx` and the API service; replace metadata-only attachments with real upload/download references. Have the backend validate type, size, access, and content.
6. Let the backend generate IDs and timestamps, validate input, enforce ownership, and provide pagination. Map backend errors in the service to clear messages. Set API CORS for the eventual frontend origin.
7. Your deployment teammate can upload `dist/` to the agreed static hosting setup after `npm run build`. This project does not create S3, CloudFront, IAM, Lambda, DynamoDB, or other AWS resources.

Demo data is browser-local, visible to anyone using the same browser profile, and intended only for coursework demonstrations. The seed dates are fixed sample dates.


## Sharing with your team

See [AWS_HANDOFF.md](AWS_HANDOFF.md) for GitHub upload instructions, the proposed API contract, integration files, and the static deployment checklist. The visual design editor has been removed. This remains a frontend prototype until your team connects the real API and authentication.
