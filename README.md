# 🏡 House Price Predictor – Frontend

This is the frontend for the **House Price Predictor** project, built with [Next.js 15](https://nextjs.org/). It provides a user-friendly UI that interacts with a machine learning model deployed via FastAPI.

---

## 🔧 Tech Stack

- Next.js 15 (App Router)
- Tailwind CSS
- React Hook Form + Zod (form validation)
- Vercel (for deployment)
- FastAPI (backend inference server)

---

## 🧑‍💻 Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/ranesh1104/house-price-predictor.git
cd house-price-predictor
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install

```

### 3. Configure Environment Variables
Create a .env file in the root directory and add the following:

```bash

NEXT_PUBLIC_API_URL=http://localhost:8000

```

If your FastAPI backend is running locally, make sure it’s running on port 8000 (or update the URL accordingly).

The NEXT_PUBLIC_ prefix is required for frontend access in Next.js.


### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open your browser to http://localhost:3000
You should see the House Price Predictor form.

### 🚀 Deploying to Vercel
If you're deploying this frontend to Vercel:

1. Connect this GitHub repo to Vercel.
2. In your Vercel Dashboard, go to Settings → Environment Variables.
3. Add the following variable:

```bash

NEXT_PUBLIC_API_URL=https://<your-render-backend-service>.onrender.com

```

### 💡 Notes
- The app uses Zod and React Hook Form for form validation.
- Predicted prices and form history are saved to localStorage to improve UX.
- You can copy, reset, and reapply form presets like "Luxury Villa" and "Budget Home".

### 🙌 Acknowledgements
- Frontend built with ❤️ using Next.js and ShadCN UI (ChatGPT & v0)
- Backend powered by FastAPI