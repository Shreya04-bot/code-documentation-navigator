# Code Document Navigator 🚀

A FastAPI-powered backend for navigating, analyzing, and querying code documentation. This service is designed to act as the **core API layer** for a full-stack application where users can upload codebases, explore documentation, and later extend into search, RAG, or AI-assisted code understanding.

This README is intentionally **very detailed** so future-you (and recruiters 👀) understand exactly what’s going on.

---

## 📌 Project Overview

**Code Document Navigator** is a backend service built using **FastAPI** that:

* Exposes REST APIs for interacting with code documentation
* Acts as a backend foundation for a frontend UI (React / Vite / Next.js, etc.)
* Is structured to be deployment-ready
* Is extensible for AI features like RAG, embeddings, and semantic search

At the moment, this repository focuses on the **backend setup and API server**.

---

## 🧠 Tech Stack

* **Python 3.10+** – Core language
* **FastAPI** – Web framework
* **Uvicorn** – ASGI server
* **Virtual Environment (venv)** – Dependency isolation
* **CORS Middleware** – Frontend-backend communication

---

## 📂 Project Structure

```
Server/
│
├── venv/                    # Python virtual environment
│
├── api/
│   ├── __init__.py
│   ├── routes.py            # API route definitions
│
├── app.py                   # Main FastAPI application entry point
│
├── requirements.txt         # Python dependencies
│
└── README.md                # Project documentation
```

### 🔹 app.py

This is the **entry point** of the backend.

Responsibilities:

* Create FastAPI app instance
* Configure middleware (CORS, etc.)
* Include API routers

Example responsibility breakdown:

* App initialization
* Global middleware
* Router registration

---

### 🔹 api/routes.py

Contains all API endpoint definitions.

Responsibilities:

* Define route groups (e.g. `/docs`, `/files`, `/health`)
* Separate business logic from app startup
* Keep `app.py` clean and readable

This modular structure makes the app scalable as the number of endpoints grows.

---

## ⚙️ Setup Instructions (Local Development)

Follow these steps **exactly** to avoid Windows pain™.

---

### 1️⃣ Clone the Repository

```
git clone <your-repo-url>
cd Code-Document-Navigator/Server
```

---

### 2️⃣ Create Virtual Environment

```
python -m venv venv
```

This creates an isolated Python environment so dependencies don’t clash with system Python.

---

### 3️⃣ Activate Virtual Environment

**Command Prompt (Windows):**

```
venv\Scripts\activate
```

If activated correctly, you’ll see:

```
(venv)
```

---

### 4️⃣ Install Dependencies

```
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If `requirements.txt` doesn’t exist yet:

```
pip install fastapi "uvicorn[standard]"
```

---

## ▶️ Running the Server

⚠️ **Do NOT run FastAPI using `python app.py`**

### Correct Way (Always Works on Windows)

```
python -m uvicorn app:app --reload
```

Explanation:

* `app` → file name (`app.py`)
* `app` → FastAPI instance inside that file
* `--reload` → auto-restart on code changes (development mode)

---

## 🌐 Accessing the Application

Once the server is running:

* **Base URL:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
* **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

Swagger UI is auto-generated and lets you test APIs directly from the browser.

---

## 🔐 CORS Configuration

CORS (Cross-Origin Resource Sharing) is enabled so that:

* Frontend (React/Vite/etc.) can communicate with backend
* APIs can be accessed from different origins

Typical use cases:

* Frontend on `localhost:3000`
* Backend on `localhost:8000`

---

## 🧪 Development Notes

* Always activate the virtual environment before running the server
* Install new dependencies using `pip install <package>` **inside venv**
* After installing new packages, update:

```
pip freeze > requirements.txt
```

---

## 🚀 Deployment Ready

This backend is structured to be deployed on:

* Render
* Railway
* AWS EC2
* Docker (future-ready)

Minimal changes needed for production:

* Disable `--reload`
* Add environment variables
* Use production ASGI server settings

---

## 🔮 Future Enhancements

Planned / possible extensions:

* 📄 Codebase upload and parsing
* 🔍 Full-text & semantic search
* 🤖 RAG-based documentation Q&A
* 🧠 Embeddings with vector DB (FAISS / Pinecone)
* 🖥️ Frontend integration
* 🔐 Auth & role-based access

---

## 🧑‍💻 Author

Built with ❤️ by **Aarohi**

Computer Science Engineering (B.Tech)

---

## ⭐ Final Notes

If something breaks:

* Check venv activation
* Check installed packages
* Use `python -m uvicorn` instead of `uvicorn`

Windows may be chaotic, but this setup is solid.

Happy shipping 🚢🔥
