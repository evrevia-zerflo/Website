#!/usr/bin/env bash

echo "Starting EVRÉVIA servers..."

# Start backend
source backend/venv/bin/activate
# Use the venv's python explicitly to ensure it loads the correct site-packages
PYTHONPATH=. backend/venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --reload --port 8000 &
BACKEND_PID=$!

# Start customer frontend
cd frontend
node ./node_modules/vite/bin/vite.js --host --port 5173 &
FRONTEND_PID=$!
cd ..

# Start admin frontend
cd admin-frontend
node ./node_modules/vite/bin/vite.js --host --port 5174 &
ADMIN_PID=$!
cd ..

# Cleanup function to kill all servers on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill $ADMIN_PID 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

echo "Servers started!"
echo "Backend: http://localhost:8000"
echo "Customer Store: http://localhost:5173"
echo "Admin Dashboard: http://localhost:5174"
echo "Press Ctrl+C to stop all servers."

# Wait indefinitely until interrupted
wait $BACKEND_PID $FRONTEND_PID $ADMIN_PID
