# Store Rating Portal

A full-stack web application built with **React.js**, **Express.js**, and **MySQL** that enables users to browse registered stores and submit 1–5 star ratings. The application uses a single unified authentication system with Role-Based Access Control (RBAC) supporting three distinct user roles: System Administrator, Normal User, and Store Owner.

---

## 📌 Project Features & User Roles

### 1. System Administrator
- **Platform Overview:** High-level dashboard displaying live counts for Total Users, Total Stores, and Total Submitted Ratings.
- **User & Store Management:** Ability to create new Admin users, Normal users, Store Owners, and Store profiles.
- **Data Tables & Filtering:** View all users and stores with column-level sorting (Ascending / Descending) and multi-field search filters (Name, Email, Address, Role).
- **Store Owner Integration:** Displays current store ratings linked directly to Store Owner profiles.

### 2. Normal User
- **Account Registration & Authentication:** Self-signup with client & server-side form validations and password hashing.
- **Store Explorer:** Browse all registered stores with real-time search (by Name or Address) and sorting.
- **Rating System:** View average store ratings, see personal previously submitted ratings, and submit or modify 1–5 star ratings.
- **Account Security:** Update account password post-login.

### 3. Store Owner
- **Owner Dashboard:** Overview of store performance showing overall average rating and total feedback received.
- **Customer Feedback Breakdown:** View a detailed list of users who have rated their store along with individual rating scores.
- **Account Security:** Update account password post-login.

---

## 🛠️ Tech Stack & Key Libraries

- **Frontend:** React.js, React Router DOM (v6), Axios, CSS Modules / Standard CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL using `mysql2/promise` (Connection Pooling & Parameterized Queries)
- **Authentication & Security:** JSON Web Tokens (JWT), `bcryptjs` for password hashing
- **Environment Management:** `dotenv`

---

## 📐 Validation Rules

Form validations are enforced on both the client-side (for responsive UX) and backend middleware (for API security):

| Field | Constraint / Rule |
| :--- | :--- |
| **Name** | Minimum 20 characters, Maximum 60 characters |
| **Address** | Maximum 400 characters |
| **Password** | 8 to 16 characters, must include at least 1 uppercase letter and 1 special character |
| **Email** | Valid RFC-compliant email structure (`user@domain.com`) |
| **Rating** | Integer score between 1 and 5 |

---

## 📷 Store Rating Platform Snapshots :
<img width="1919" height="1075" alt="image" src="https://github.com/user-attachments/assets/48ba214c-8c77-4266-9161-e181dbbacc02" />
<img width="1919" height="1090" alt="image" src="https://github.com/user-attachments/assets/f9d01e48-d264-4df5-9f3b-ae93860ecbc2" />
<img width="1919" height="1033" alt="image" src="https://github.com/user-attachments/assets/bdee2b85-4cf4-4b58-a27c-93017a6b975b" />
<img width="1919" height="1024" alt="image" src="https://github.com/user-attachments/assets/5a06bdbc-2383-459a-95da-f51d9380d0df" />


