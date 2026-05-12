# ERMS Backend

Employee Resource Management System (ERMS) Backend API.

## Tech Stack
- **Node.js**
- **PostgreSQL 14+**
- **node-pg-migrate** (Database Migration Tool)

---

## Getting Started (Database Setup)

Follow these steps to set up your local development database.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (LTS Version)
- [PostgreSQL](https://www.postgresql.org/download/) (v14 or higher)

### 2. Create the Database
Open your PostgreSQL terminal (`psql`) or a database client (like pgAdmin / DBeaver) and create the development database:
```sql
CREATE DATABASE erms_dev;