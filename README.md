# FastAPI & PostgreSQL Backend Learning Repository

<div align="center">

![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python&logoColor=white&style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-Framework-009688?logo=fastapi&logoColor=white&style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql&logoColor=white&style=for-the-badge)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-CA4245?logo=sqlalchemy&logoColor=white&style=for-the-badge)
![Pydantic](https://img.shields.io/badge/Pydantic-V2-FF1493?logo=pydantic&logoColor=white&style=for-the-badge)

![Git](https://img.shields.io/badge/Git-Version%20Control-F05032?logo=git&logoColor=white&style=for-the-badge)
![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github&logoColor=white&style=for-the-badge)
![VS Code](https://img.shields.io/badge/VS%20Code-Editor-007ACC?logo=visualstudiocode&logoColor=white&style=for-the-badge)

**A comprehensive learning repository for building production-ready REST APIs with FastAPI and PostgreSQL**

</div>

---

## Overview

> This repository documents my **daily learning and hands-on practice** in **Python backend development** using **FastAPI** and **PostgreSQL**.
>
> Each commit represents **end-of-day progress**, including newly learned concepts, practical implementations, experiments, and refactoring as my understanding improves. The goal is to **track real learning progress** and build a strong backend foundation.

---

## Technology Stack

### Backend & Database Layer

| Component | Technology | Details |
|:----------|:-----------|:--------|
| **Language** | Python | 3.x |
| **Framework** | FastAPI | Modern, fast, with automatic API docs |
| **Database** | PostgreSQL | Powerful relational database |
| **Driver** | psycopg | PostgreSQL adapter for Python |
| **ORM** | SQLAlchemy | SQL toolkit and object-relational mapping |
| **Validation** | Pydantic | Data validation using Python type hints |

### Development & Tools

| Component | Technology | Details |
|:----------|:-----------|:--------|
| **API Docs** | Swagger UI & ReDoc | Auto-generated interactive documentation |
| **Testing** | Postman | REST client for comprehensive API testing |
| **DB Admin** | pgAdmin | PostgreSQL GUI administration panel |
| **VCS** | Git & GitHub | Version control and repository hosting |
| **Editor** | VS Code | Code editor with Python support |

---

## Skills & Concepts Covered

### Environment Setup

- Python installation on Windows and macOS
- Visual Studio Code setup for backend development
- Python virtual environments (venv, virtualenv)
- Dependency management using pip and requirements.txt

---

### FastAPI Development

**Core Concepts:**
- Creating and running FastAPI applications
- HTTP methods and path operations (GET, POST, PUT, DELETE)
- Proper HTTP status codes (200, 201, 204, 404, etc.)
- CRUD operations implementation

**Advanced Features:**
- Request and response schema validation with Pydantic
- Error handling with HTTPException and custom status codes
- Dependency injection patterns with `Depends()`
- Async/await for non-blocking operations
- Automatic interactive API documentation (Swagger UI and ReDoc)

**Architecture:**
- Python package structure and imports
- Database integration and session management
- Route organization and best practices

---

### PostgreSQL & SQL

**Fundamentals:**
- Database design and normalization
- Table creation and schema management
- Data types and constraints

**Query Operations:**
- SELECT queries with WHERE, ORDER BY, LIMIT, OFFSET
- INSERT for adding records
- UPDATE for modifying data
- DELETE for removing records
- Advanced SQL operators (IN, LIKE, JOIN, etc.)

**Tools & Management:**
- PostgreSQL installation and configuration
- pgAdmin for GUI database administration
- psycopg for Python connectivity
- Raw SQL execution in FastAPI applications

---

### SQLAlchemy ORM

**Model Definition:**
- Defining database models using SQLAlchemy ORM
- Creating table schemas using Python classes
- Column types and constraints
- Primary keys and relationships

**Session Management:**
- Database connection configuration
- Session factories and lifecycle management
- Transaction handling and commit/rollback

**Advanced Features:**
- Query builders for safe SQL generation
- ORM-based CRUD operations
- Automatic timestamp handling with server defaults
- Dependency injection for database sessions in FastAPI

---

## Repository Structure

```
sql-and-postgres/
├── app/                             # FastAPI application package
│   ├── __init__.py                  # Package initialization
│   ├── main.py                      # FastAPI app with REST API endpoints (CRUD)
│   ├── models.py                    # SQLAlchemy ORM models
│   ├── schemas.py                   # Pydantic schemas for validation
│   └── database.py                  # Database connection & session management
├── __pycache__/                     # Python cache files
└── README.md                        # This file
```

### File Descriptions

| File | Purpose |
|------|---------|
| **main.py** | FastAPI application with route handlers for all CRUD operations on products |
| **models.py** | SQLAlchemy ORM model defining the `Products` table schema with columns |
| **schemas.py** | Pydantic schemas for request/response validation and type safety |
| **database.py** | Database connection setup, session factory, and dependency injection function |

---

## Current Project: Products Management API

A RESTful API for managing product inventory with **FastAPI**, **PostgreSQL**, and **SQLAlchemy ORM**.

### Core Features

**Data Management:**
- Create new products with name, price, and inventory details
- Retrieve all products with filtering capabilities
- Fetch individual product details by ID
- Update existing product information
- Delete products from inventory

**API Quality:**
- Proper HTTP status codes for all operations
- Input validation with Pydantic schemas
- Error handling with detailed error messages
- Automatic API documentation with Swagger UI
- RESTful endpoint design principles

### API Endpoints Reference

| Method | Endpoint | Status | Description |
|:------:|:---------|:------:|-------------|
| `GET` | `/` | 200 | Root endpoint - API health check |
| `GET` | `/products` | 200 | Retrieve all products |
| `POST` | `/products` | 201 | Create a new product |
| `GET` | `/posts/{id}` | 200 | Get a specific product by ID |
| `PUT` | `/posts/{id}` | 200 | Update a product |
| `DELETE` | `/posts/{id}` | 204 | Delete a product |

---

## Getting Started

### Prerequisites

- **Python 3.x** - Programming language
- **PostgreSQL** - Database server
- **pip** - Python package manager

### Quick Start Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd sql-and-postgres

# 2. Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install required dependencies
pip install fastapi sqlalchemy psycopg2 pydantic python-dotenv uvicorn

# 4. Set up PostgreSQL database
createdb fastapi  # Create database named 'fastapi'

# 5. Update database credentials in database.py
# Modify the connection string with your PostgreSQL username and password

# 6. Run the application
uvicorn app.main:app --reload
```

---

## Running the Application

### Start the Server

```bash
uvicorn app.main:app --reload
```

The `--reload` flag enables auto-restart on code changes during development.

### Access Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI** (Interactive API explorer):
  ```
  http://localhost:8000/docs
  ```

- **ReDoc** (Alternative API documentation):
  ```
  http://localhost:8000/redoc
  ```

- **OpenAPI Schema** (JSON format):
  ```
  http://localhost:8000/openapi.json
  ```

---

## API Usage Examples

### Get All Products

```bash
curl -X GET "http://localhost:8000/products"
```

### Create a Product

```bash
curl -X POST "http://localhost:8000/products" \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "price": 999, "inventory": 10}'
```

### Get a Specific Product

```bash
curl -X GET "http://localhost:8000/posts/1"
```

### Update a Product

```bash
curl -X PUT "http://localhost:8000/posts/1" \
  -H "Content-Type: application/json" \
  -d '{"name": "Desktop", "price": 1299, "inventory": 5}'
```

### Delete a Product

```bash
curl -X DELETE "http://localhost:8000/posts/1"
```

---

## Project Architecture

```
Request ──> FastAPI Router ──> Pydantic Validation ──> SQLAlchemy ORM ──> PostgreSQL
                                  (Schema Check)         (Query Builder)    (Database)
```

---

## Learning Resources

- [FastAPI Official Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Notes

This repository serves as a learning journal for backend development concepts. Code is organized for educational purposes with clear separation of concerns following FastAPI best practices.

