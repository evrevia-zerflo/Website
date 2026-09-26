#!/usr/bin/env bash

echo "Starting EVRÉVIA MVP servers..."

# Start backend
source backend/venv/bin/activate
# Use the venv's python explicitly to ensure it loads the correct site-packages
PYTHONPATH=. backend/venv/bin/python -m uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
cd frontend
node ./node_modules/vite/bin/vite.js --port 5173 &
FRONTEND_PID=$!
cd ..

# Cleanup function to kill both servers on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

echo "Servers started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop all servers."

# Wait indefinitely until interrupted
wait $BACKEND_PID $FRONTEND_PID
