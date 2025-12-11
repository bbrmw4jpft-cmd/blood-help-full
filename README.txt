
BloodConnect — Enhanced Prototype (Frontend + Backend + SQLite DB)
=================================================================

What I built for you:
- Frontend: public/index.html, public/styles.css, public/app.js (modern UI, Home and Settings buttons, 3D card tilt animation)
- Admin: public/admin.html (view donors and requests from DB)
- Backend: server.js (Node + Express API)
- DB: data/bloodconnect.db (SQLite pre-populated with sample donors)
- init_db.js: Node script to (re)create DB if needed
- package.json: Node dependencies and scripts

How the prototype works:
- The frontend tries to call the backend at /api. If server isn't running, it falls back to built-in sample data.
- Backend endpoints:
  - GET /api/ping -> {pong:true}
  - GET /api/donors?blood=&pincode= -> list of verified donors matching filters
  - GET /api/donors/:id -> single donor
  - POST /api/requests -> create emergency request (saves in SQLite) returns {requestId, eta, totalRequests}
  - GET /api/requests -> list requests (for admin)

Run locally (Node required):
1. Open terminal in the project folder (bloodconnect_full).
2. Install dependencies: npm install
3. Initialize DB (optional): npm run init-db
4. Start server: npm start
5. Open http://localhost:3000 in your browser. Admin page: http://localhost:3000/admin.html

Deploy suggestions:
- Use Render / Railway / Heroku / Fly for Node deployment. Upload the folder and set start command `node server.js`.
- For static-only hackathon quick deploy, use Netlify with the 'public' folder (but backend won't run on Netlify). For full demo use Render (free tier) which supports Node + SQLite (or use PostgreSQL instead).

Notes & next steps I can do for you now:
- Convert DB to PostgreSQL or provide Dockerfile for containerized deployment.
- Add authentication for admin and donor registration flow.
- Add verification flow (upload ID) and SMS/WhatsApp notifications (requires external API keys).
- Prepare a 5-slide pitch deck and demo script for hackathon judges.

Files created in the package:
- public/index.html
- public/styles.css
- public/app.js
- public/admin.html
- server.js
- init_db.js
- package.json
- data/bloodconnect.db

You can download the full project as a zip and run locally.
