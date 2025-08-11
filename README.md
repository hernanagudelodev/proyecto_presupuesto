# 💰 Budget App – Personal Finance & Budget Management API

**Status:** In Development – Internal project with a planned commercial release. Backend foundations complete, including user management, accounts, transactions, categories, and budgets.

## 📌 Overview
**Budget App** is a **FastAPI-based backend** for personal and multi-user budget management.  
It provides secure REST APIs for managing accounts, transactions, categories, and budgets, with authentication and role-based access control.

The project’s long-term goal is to become a **simple yet powerful** budgeting platform with AI-assisted financial insights, including natural language transaction entry and predictive cash flow analysis.

---

## 🚀 Current Features
- **User Management**
  - Registration, authentication, and profile management.
  - JWT-based authentication.
- **Accounts Module**
  - Create and manage multiple accounts per user.
- **Categories Module**
  - Flexible category system for income and expenses.
- **Transactions Module**
  - Record and track transactions linked to accounts and categories.
- **Budgets Module**
  - Define budgets per category and track spending progress.
- **API Documentation**
  - Auto-generated OpenAPI/Swagger documentation.

---

## 🛠 Planned Features (Roadmap)
### Phase 1 – AI Integration
- AI assistant to monitor spending against budgets.
- Natural language transaction entry.
- Intelligent recommendations for saving and optimizing expenses.

### Phase 2 – Predictive Cash Flow
- Forecast future account balances based on recurring transactions.
- Graphical representation of expected cash flow.

### Phase 3 – Frontend Development
- Web and/or mobile frontend for a complete user experience.

---

## 🛠 Tech Stack
- **Backend:** Python 3.13.6, FastAPI
- **Database:** PostgreSQL (production target)
- **Deployment:** Docker + CI/CD pipeline
- **Authentication:** JWT-based with FastAPI Users
- **API Documentation:** OpenAPI/Swagger

---

## 📂 Current Modules
- **Users** – Full authentication and profile management.
- **Accounts** – Multi-account support per user.
- **Categories** – Income and expense categories.
- **Transactions** – Linked to accounts and categories.
- **Budgets** – Per-category budget limits and progress tracking.

---

## 📸 Screenshots
*(To be added)*  
Suggested: Swagger API docs view, budget tracking examples.

---

## ⚙️ Installation
```bash
# 1. Clone the repository
git clone https://github.com/hernanagudelodev/budget-app-backend.git
cd budget-app-backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
# Example: create a .env file and configure DATABASE_URL, SECRET_KEY, DEBUG, etc.

# 5. Run migrations
alembic upgrade head

# 6. Start the development server
uvicorn app.main:app --reload

```

---

## 📜 License
This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact
**Hernán Agudelo López**  
📧 hernanagudelodev@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/hernan-agudelo) | [GitHub](https://github.com/hernanagudelodev)
