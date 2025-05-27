# FeedbacksApp
Simple feedback management system built with Vue 3, Vuetify, Express, and MongoDB.

A lightweight feedback management system built with:
- 🖥️ Frontend: Vue 3 + Vuetify
- 🌐 Backend: Node.js + Express
- 🗄️ Database: MongoDB with Mongoose

Users can submit feedback, and admins can view and manage submissions via a dedicated panel.

## Getting Started

### 1. Clone the repository

git clone https://github.com/yberman8/FeedbacksApp.git

Frontend: 

 Install dependencies
```bash
cd client
npm install

Create .env file
VITE_BASE_URL="http://localhost:3000"

 Run the project:
npm run dev


Backend:

cd server
npm install

Create .env file
VITE_BASE_URL="http://localhost:3000"

SECRET_WORD="feedbackProjectDemo"
PORT="3000"
PORT_FRONTEND="5173"
MONGODB_URI='mongodb://127.0.0.1:27017/simplefeedback'

 Run the project:
node app.js

## Features

- ✅ Submit feedback with rating and message
- ✅ Admin dashboard with filters and statistics
- ✅ Responsive UI (Vuetify)
- ✅ Sample admin + demo feedbacks generated on first run

## Demo Admin

**Email**: admin@example.com  
**Password**: Admin1234


## Tech Stack

- Vue 3
- Vuetify 3
- Vite
- Node.js
- Express.js
- MongoDB + Mongoose

## Screenshots

![Feedback Form](screenshots/form.png)
![Admin login](screenshots/login.png)
![Admin Panel](screenshots/admin.png)


