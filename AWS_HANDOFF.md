# Team handoff: frontend to AWS

## Current status

The frontend is ready to commit to GitHub and to build as static files. It is **not connected to AWS yet**. Setting an API URL alone does not enable real requests; the service methods must be implemented by the integration team. No AWS credentials, database, backend, or infrastructure configuration are included. The temporary visual editor has been removed.

## Sharing on GitHub

Upload this project folder's contents to your repository root, including `src/`, `package.json`, `package-lock.json`, `vite.config.js`, `index.html`, `.env.example`, `.gitignore`, and the Markdown guides. Do not upload `node_modules/`, `dist/`, or your personal `.env` files. The supplied `.gitignore` excludes these when using Git. If uploading through GitHub's website, select only the source files explicitly: browser uploads do not use `.gitignore` as a filter.

Each teammate can clone/download the repository, open the project folder in a terminal, and run:

```sh
npm ci
npm run dev
```

The lockfile provides reproducible dependency installation. For validation, use `npm test` and `npm run build`.

## Files to connect

| File | Integration work |
| --- | --- |
| `src/services/ticketService.js` | Replace browser storage with API Gateway requests; attach the access token and map errors/response data. |
| `src/hooks/useTickets.jsx` | Adapt the API response shape, pagination, and loading/errors if necessary. |
| `src/App.jsx` | Replace the mock session and role handling with verified authentication and sign-out. |
| `src/pages/Login.jsx` | Replace demo role selection with the agreed Cognito sign-in flow. |
| `src/data/mockData.js` | Replace sample profiles and staff options with API-backed data. |
| `src/pages/CreateTicket.jsx` | Connect the agreed file upload flow; currently only file metadata is retained. |
| `src/pages/TicketDetails.jsx` | Replace sample staff options and attachment metadata with real staff and authorized download references. |
| `.env` / build environment | Set public `VITE_API_URL` and any agreed public Cognito configuration before building. |

## Agree on this API contract together

The following endpoints are a **proposal**, not existing backend routes. Match the frontend service to whichever routes the backend team chooses.

| Service method | Suggested endpoint | Expected frontend result |
| --- | --- | --- |
| `list()` | `GET /tickets` | Array of tickets visible to the signed-in user. |
| `create(fields)` | `POST /tickets` | Created ticket. |
| `update(id, changes, message)` | `PATCH /tickets/{id}` | Updated ticket; server creates an audit entry. |
| `reply(id, body, author)` | `POST /tickets/{id}/replies` | Updated ticket including replies and activity. |

If your API wraps results in an object or returns a reply instead of a ticket, translate that in the service. `useTickets` refreshes the list after mutations. The `message` and `author` arguments exist for the demo: the backend must derive the real actor from a verified token and generate the audit trail itself.

Ticket fields currently consumed by the UI:

```json
{
  "id": "HD-1049",
  "title": "Cannot connect to Wi-Fi",
  "description": "The connection drops during lectures.",
  "category": "Wi-Fi",
  "priority": "Medium",
  "status": "Open",
  "createdAt": "2026-11-15T09:30:00.000Z",
  "studentId": "verified-user-id",
  "studentName": "Student Name",
  "assignedTo": "",
  "attachments": [],
  "replies": [],
  "activity": [{"text": "Ticket submitted", "date": "2026-11-15T09:30:00.000Z"}]
}
```

Allowed UI values: categories `Wi-Fi`, `Software`, `Hardware`, `Account`, `Other`; priorities `Low`, `Medium`, `High`; statuses `Open`, `In progress`, `Resolved`. Replies use `{id, body, author, date}`. Current attachments use `{name, size}` only. Agree on durable staff IDs and attachment IDs/URLs before implementing real assignments and uploads.

## Deployment teammate

1. Complete authentication and API integration first if the demonstration requires real cloud ticket operations.
2. Supply the public configuration before `npm run build`. Vite embeds these values in the generated browser assets; rebuild after changing them. Never put AWS secret keys, client secrets, or database credentials in a `VITE_` variable.
3. Run `npm ci`, `npm test`, and `npm run build`.
4. Deploy the **contents of `dist/`**, including `index.html` and `assets/`, to the team's S3/CloudFront setup. Do not deploy the source folder or `node_modules/`.
5. The app uses hash routes (`/#/student`), so its page navigation does not require SPA path rewrites. The default Vite base path assumes the site is hosted at the domain root. Hosting under a subdirectory requires an agreed `base` setting in `vite.config.js` and a rebuild.
6. Configure API CORS for the frontend origin, required methods, and authentication headers. Serve the deployed app over HTTPS and verify login, ticket ownership, staff permissions, uploads, replies, and refresh/navigation against the actual AWS environment.

Frontend build checks cannot verify the team's AWS account, IAM, Cognito, API Gateway, Lambda, DynamoDB, CORS, or CloudFront configuration. Those checks remain with the backend/deployment owners. No AWS resources have been created or tested by this project.
