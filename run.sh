#!/bin/bash

echo "🚀 Starting SIMS Application..."
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $SERVER_PID 2>/dev/null
    wait $SERVER_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to catch Ctrl+C (SIGINT) and cleanup
trap cleanup SIGINT SIGTERM

# Start Backend
echo "📡 Starting Server (Spring Boot)..."
./gradlew :server:bootRun > server.log 2>&1 &
SERVER_PID=$!
echo "   Server PID: $SERVER_PID"

# Wait for backend readiness (up to 60s)
echo "⏳ Waiting for backend to become ready..."
for i in {1..60}; do
  if curl -fsS -I http://localhost:8080 >/dev/null 2>&1; then
    echo "✅ Backend is up (responded on :8080)"
    break
  fi
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Backend process exited unexpectedly. Check server.log"
    cleanup
  fi
  sleep 1
  if [ "$i" -eq 60 ]; then
    echo "❌ Backend did not start within 60 seconds. Check server.log"
    cleanup
  fi
done

echo "✅ SIMS is running!"
echo "   Server: http://localhost:8080"
echo "   Client: Desktop window"
echo ""
echo "💡 Press Ctrl+C to stop everything"
echo ""

./gradlew :client:run

# If client exits normally, cleanup
cleanup
