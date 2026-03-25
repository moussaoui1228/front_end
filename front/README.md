# 🌿 Project: TAZDAYTH - Kabyle Gold

This project is a full-stack e-commerce website for Kabyle olive oil. It includes a modern Vite/React frontend and a robust Node/Express/TypeScript backend.

## 🚀 Quick Start (Local Development)

To run the project for the first time, follow these steps:

### 1. **MongoDB Connection**
Ensure you have **MongoDB** installed and running on your system (`mongodb://127.0.0.1:27017/tazdayth`).

### 2. **Backend Setup**
Open a terminal in the `server` directory:
```bash
cd server
npm install
npm run seed   # This populates wilayas and oil prices
npm run dev    # This starts the backend on port 5000
```

### 3. **Frontend Setup**
Open another terminal in the root directory:
```bash
npm install
npm run dev    # This starts the frontend, usually on port 8080 or 5173
```

---

## 🔑 Key Features

### 🔓 Authentication & Forgotten Passwords
- **Registration**: Store user name, phone, and email.
- **Login**: Secure login with JWT tokens.
- **Reset PIN**: If forgot password, a 6-digit numeric code is sent via email (SMTP). Current SMTP settings are in `server/.env`.
- **Reset Logic**: Verification code expires after 15 minutes.

### 🛒 Boutique & Orders
- **Multi-item Cart**: Users can add different oils and quantities.
- **Shipping**: Automatically calculated based on the selected Wilaya.
- **Orders**: Stored in a database with states: `pending`, `confirmed`, `completed`, `cancelled`.

### 🌿 Trituration (Pressing)
- Users can request pressing for their own olives.
- Choice of payment: **Money (DA/kg)** or **Oil Percentage (30%)**.
- Minimum quantity: 50 kg.

---

## 🌐 Deployment to Vercel (Frontend)

1. Sign in to [Vercel](https://vercel.com).
2. Click **"Add New"** > **"Project"**.
3. Import your GitHub repository.
4. Set the **Framework Preset** to Vite.
5. In **Environment Variables**, add:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://api.tazdayth.com/api`).
6. Click **Deploy**.

## 🏗️ Deployment to Render/Railway (Backend)

1. Choose a **Web Service** on Render or a **Service** on Railway.
2. Build command: `cd server && npm install && npm run build`.
3. Start command: `cd server && npm start`.
4. Copy all variables from `server/.env` to the host's **Environment Variables** dashboard.

---

### **Need Help?**
If you have any issues, please refer to the project documentation or contact the development team.