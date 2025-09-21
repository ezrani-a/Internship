
---

## ⚙️ Environment Variables

All environment-specific configurations are set in the `.env` file. Below is a description of each variable used in the project:

### 🔗 Database Configuration

| Variable     | Description                      | Example           |
|--------------|----------------------------------|-------------------|
| `DB_HOST`    | Hostname of the MySQL database   | `localhost`       |
| `DB_USER`    | Database username                | `root`            |
| `DB_PASSWORD`| Database password                | `simplepassword123` |
| `DB_NAME`    | Name of the database             | `debo_job_portal` |

### 🔐 Authentication

| Variable     | Description                      | Example           |
|--------------|----------------------------------|-------------------|
| `JWT_SECRET` | Secret key for signing JWT tokens | `myDeboSuperSecretKey@123$%^MakeThisLongAndRandom` |

### 🌐 Server Configuration

| Variable     | Description                      | Example           |
|--------------|----------------------------------|-------------------|
| `PORT`       | Port on which the backend server runs | `5000`        |

### 📧 Email Configuration

Used for sending registration confirmations, password resets, etc.

| Variable       | Description                     | Example                         |
|----------------|----------------------------------|----------------------------------|
| `EMAIL_SERVICE`| Email service provider (e.g., Gmail, Outlook) | `gmail`          |
| `EMAIL_USER`   | Email address used to send mails | `your-email@gmail.com`          |
| `EMAIL_PASS`   | App-specific password for email  | `your-app-password`             |
| `EMAIL_FROM`   | Display name and email for sending mails | `Debo Engineering <noreply@deboengineering.com>` |

### 🌍 Frontend Configuration

| Variable       | Description                     | Example                         |
|----------------|----------------------------------|----------------------------------|
| `FRONTEND_URL` | Base URL of the frontend app for link generation | `http://localhost:3000` |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher
- [MySQL](https://www.mysql.com/)
- [Postman](https://www.postman.com/) for testing APIs (optional)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/debo-job-portal.git
   cd debo-job-portal/backend
