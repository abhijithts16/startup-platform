# 🚀 Startup Platform

A full-stack web platform for collecting startup ideas and funding interests. Built with Angular 19 (frontend) and ASP.NET Core (backend), with secure file handling using AWS S3.

---

## 🔧 Features

### 🖥️ Frontend (Angular 19)
- Responsive single-page application (SPA)
- Routes:
  - Home page
  - Dynamic submission form (for idea submitters and funders)
  - Hidden admin dashboard (accessible via direct URL)
- Form input + file upload handling
- Admin page to view and download user-submitted data (with file links to AWS S3)
- Uses Bootstrap 5 for styling

### 🛠️ Backend (ASP.NET Core)
- RESTful API using ASP.NET Core 9
- PostgreSQL database (via Supabase)
- AWS S3 for private file uploads (presigned download URLs)
- Admin email-based gatekeeping
- Dockerized for production deployment

---

## 📁 Tech Stack

| Layer      | Tech                              |
|------------|-----------------------------------|
| Frontend   | Angular 19, Bootstrap 5           |
| Backend    | ASP.NET Core 9 + EF Core          |
| Database   | PostgreSQL (Supabase)             |
| File Store | AWS S3 (secure, private access)   |
| Hosting    | Render.com                        |
| DevOps     | Docker                            |