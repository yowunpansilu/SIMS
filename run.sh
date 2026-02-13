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

# Start server in background
echo "📡 Starting Server (Spring Boot)..."
./gradlew :server:bootRun > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start (5 seconds)..."
sleep 5

# Start client in foreground (this allows Ctrl+C to work naturally)
echo "🖥️  Starting Client (JavaFX Desktop)..."
echo ""
echo "✅ SIMS is running!"
echo "   Server: http://localhost:8080"
echo "   Client: Desktop window"
echo ""
echo "💡 Press Ctrl+C to stop everything"
echo ""

./gradlew :client:run

# If client exits normally, cleanup
cleanup
