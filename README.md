# 💰 Budget App – Full-Stack Personal Finance Platform

**Status:** ✅ Deployed to Production | 🚀 Actively in Development

A full-stack personal finance application featuring a robust **FastAPI** backend and a modern **React** frontend, deployed on **Railway**! This project is designed to showcase a scalable, secure, and feature-rich web application architecture.

## 🌐 Live Demo

You can test the live application here: **[https://frontend-production-e146.up.railway.app/]**

_(Note: New user registration is enabled.)_

---

## ✨ Key Features

### ✅ Backend (FastAPI)
- **Complete User Management:** Secure registration, JWT-based authentication, email verification, and password recovery, all powered by `fastapi-users`.
- **Asynchronous Email Notifications:** Reliable transactional email delivery integrated with **SendGrid**.
- **Accounts Module:** Full CRUD functionality for managing multiple user accounts (e.g., Bank, Cash, Credit Card) with real-time balance calculation.
- **Categories Module:** Flexible system for creating and managing personalized income and expense categories.
- **Transactions Module:** Endpoints to record, read, update, and delete transactions, linked to accounts and categories.
- **Recurring Rules Engine:** Allows users to create rules (e.g., "monthly salary," "rent payment") to automatically generate planned transactions.
- **Admin Panel:** Secure endpoints for a superuser to list and modify other users' data.
- **Data Security:** Strict data isolation ensuring users can only access their own financial information.
- **Automated API Documentation:** Interactive OpenAPI (Swagger UI) and ReDoc documentation generated automatically.

### ✅ Frontend (React)
- **Modern Tech Stack:** Built with React and Vite for a fast and efficient development experience.
- **Responsive Design:** The interface is adaptable for both desktop and mobile, thanks to **Mantine UI**.
- **Client-Side Routing:** Seamless navigation between public and private pages using `react-router-dom`.
- **Global State Management:** Authentication state is managed with React's Context API, ensuring a consistent user session.
- **Protected Routes:** Secure dashboard area accessible only to authenticated users.
- **Interactive Dashboard:** Dynamic charts (income vs. expenses, expenses by category) for intuitive financial visualization.
- **Full CRUD Functionality:**
    - Functional Login/Register/Logout/Verification flow.
    - Reusable components to manage Accounts, Categories, Transactions, and Recurring Rules.
    - Modal-based forms for a clean user experience.
- **User Admin Panel:** UI for superusers to manage the platform's user profiles.

---

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI
- **Frontend:** React, Vite, Axios, Mantine UI
- **Database:** PostgreSQL (Production), SQLite (Development)
- **Authentication:** JWT (`fastapi-users`)
- **Email Delivery:** SendGrid
- **Deployment:** Railway

---

## 📖 API Documentation

Once the backend server is running locally, interactive API documentation is available at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 📜 License
This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact
**Hernán Agudelo López** 📧 hernanagudelodev@gmail.com
🔗 [LinkedIn](https://www.linkedin.com/in/hernan-agudelo) | [GitHub](https://github.com/hernanagudelodev)
