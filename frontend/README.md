# Frontend

This folder contains a Vite + React + Tailwind frontend for the IoT dashboard.

To run the frontend:

```bash
cd frontend
npm install
REACT_APP_SOCKET_URL=http://localhost:3000 npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173) and ensure the Node bridge is running (default at http://localhost:3000).
