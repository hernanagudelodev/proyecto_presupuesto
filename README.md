# 💰 Budget App – Full-Stack Personal Finance Platform

**Status:** 🚀 Actively in Development

A full-stack personal finance application featuring a robust **FastAPI** backend and a modern **React** frontend. This project is designed to showcase a scalable, secure, and feature-rich web application architecture.

## 📌 Overview

**Budget App** provides a comprehensive solution for personal and multi-user budget management. The backend exposes a secure RESTful API for handling accounts, categories, and transactions, while the React frontend delivers a responsive and intuitive user interface for interacting with the financial data.

The long-term vision is to evolve this platform into a powerful budgeting tool with AI-assisted insights, including natural language transaction entry and predictive cash flow analysis.

---

## ✨ Key Features

### ✅ Backend (FastAPI)
- **Complete User Management**: Secure user registration, JWT-based authentication, email verification, password recovery, and profile management powered by `fastapi-users`.
- **Accounts Module**: Full CRUD functionality for managing multiple user accounts (e.g., Bank, Cash, Credit Card).
- **Categories Module**: Flexible system for creating and managing personalized income and expense categories.
- **Transactions Module**: API endpoints to record, retrieve, update, and delete transactions linked to specific accounts and categories.
- **Data Security**: Strict data isolation ensuring users can only access their own financial information.
- **Automated API Documentation**: Interactive OpenAPI (Swagger UI) and ReDoc documentation generated automatically by FastAPI.

### 🟡 Frontend (React)
- **Modern Tech Stack**: Built with React and Vite for a fast, efficient development experience.
- **Client-Side Routing**: Seamless navigation between public and private pages using `react-router-dom`.
- **State Management**: Global authentication state managed with React's Context API, ensuring a consistent user session.
- **Protected Routes**: Secure dashboard area accessible only to authenticated users.
- **Component-Based UI**:
    - Functional Login/Logout flow.
    - Reusable modal component for forms.
    - Dynamic data fetching and rendering for user accounts and categories.
    - Forms for creating new accounts and categories with real-time UI updates.

---

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI
- **Frontend:** React, Vite, Axios
- **Database:** SQLite (Development), PostgreSQL (Production Target)
- **Authentication:** JWT (`fastapi-users`)
- **API Documentation:** OpenAPI / Swagger UI
- **Deployment (Planned):** Docker, CI/CD

---

## 🗺️ Project Roadmap

### Phase 1 – Frontend Development (In Progress 🟡)
- **Goal:** Build a complete, functional user interface on top of the existing backend API.
- **Tasks:**
    - [x] Authentication Flow (Login/Logout, Global Context)
    - [x] Protected Routes
    - [x] View & Create User Accounts
    - [x] View & Create User Categories
    - [ ] **Next:** Implement full CRUD for Transactions.
    - [ ] Enhance the UI/UX with a component library and improved styling.
    - [ ] Develop the Budgets module frontend.

### Phase 2 – Predictive Cash Flow (Planned ⚪)
- **Goal:** Integrate financial forecasting features.
- **Tasks:**
    - Forecast future account balances based on recurring transactions.
    - Implement graphical representations of expected cash flow.

### Phase 3 – AI Integration (Planned ⚪)
- **Goal:** Leverage AI to provide intelligent financial assistance.
- **Tasks:**
    - AI assistant for monitoring spending against budgets.
    - Natural language transaction entry (e.g., "spent $5 on coffee").
    - Smart recommendations for savings and expense optimization.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js and npm

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/hernanagudelodev/proyecto_presupuesto.git](https://github.com/hernanagudelodev/proyecto_presupuesto.git)
    cd proyecto_presupuesto
    ```

2.  **Backend Setup (FastAPI):**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    # Create a .env file from .env.example and set your variables
    alembic upgrade head
    uvicorn app.main:app --reload
    ```

3.  **Frontend Setup (React):**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
The React app will be available at `http://localhost:5173`.

---

## 📖 API Documentation

Once the backend server is running, interactive API documentation is available at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 📜 License
This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact
**Hernán Agudelo López** 📧 hernanagudelodev@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/hernan-agudelo) | [GitHub](https://github.com/hernanagudelodev)