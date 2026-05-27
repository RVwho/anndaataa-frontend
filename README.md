# AnnDaataa 🌾
> Empowering farmers with AI-driven crop diagnostics and real-time market data.

AnnDaataa is an intelligent agricultural assistant designed to bridge the gap between farmers, advanced AI diagnostics, and live commodity markets. By combining computer vision analysis with local agronomic resources, AnnDaataa provides actionable advice to protect crop yields and maximize profits.

---

## 🚀 Live Demo Links
- **Frontend Web Application (Vercel):** [https://anndaataa-frontend.vercel.app/](https://anndaataa-frontend.vercel.app/)
- **Backend API Server (Render):** [https://anndaataa-backend.onrender.com](https://anndaataa-backend.onrender.com) (Note: The API may take a few seconds to spin up due to Render's free-tier cold start).

---

## ✨ Key Features
- **📸 AI Leaf Scanner:** Snap a clear photo of an infected leaf. Leveraging Google's Gemini API, the system detects diseases, calculates confidence levels, recommends specific treatments (such as Copper Fungicide), and outlines step-by-step application instructions.
- **📊 Real-Time Market Data:** Access localized Mandi price trackers. View active crop pricing per quintal, pricing trends (rising/falling), and specific market updates customized to the farmer's registered district.
- **📍 Nearby KVK Centers:** Connect instantly with regional *Krishi Vigyan Kendra* (Agricultural Science Centers) and extension offices. View exact distances, inventory match indicators for required treatments, and route navigation.
- **🌐 Bilingual Support:** Built-in localization support enabling seamless toggle between **English** and **Hindi (Devanagari)** for maximum accessibility.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 (Vite-powered HMR)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

### Backend
- **Framework:** FastAPI (Python 3)
- **Deployment & Hosting:** Render, Uvicorn
- **AI Integration:** Google GenAI SDK (Gemini Models)
- **Keep-Alive Management:** UptimeRobot (minimizing cold starts)

---

## ⚙️ Local Setup Instructions

Follow these simple steps to run both the frontend and backend servers on your local environment.

### Prerequisites
Ensure you have Node.js (v18+) and Python (v3.9+) installed on your machine.

---

### 1. Frontend Setup
Navigate to the frontend directory:
```bash
cd anndaataa-frontend
```

Install packages:
```bash
npm install
```

Configure your environment variables:
Create a `.env` file in the root of the frontend folder:
```env
VITE_API_URL=http://localhost:8000
```

Start the development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd anndaataa-backend
```

Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install backend dependencies:
```bash
pip install -r requirements.txt
```

Configure your environment variables:
Create a `.env` file in the root of the backend folder:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Launch the FastAPI server:
```bash
uvicorn main:app --reload
```
The API server will run at `http://localhost:8000`.
