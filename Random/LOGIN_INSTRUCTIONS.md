# Login Instructions

To log in for the first time:

1.  **Start the Backend**:
    Run the following command in your terminal:
    ```bash
    ./gradlew :server:bootRun
    ```

2.  **Start the Frontend**:
    Run the following command in a separate terminal:
    ```bash
    cd frontend && npm run dev
    ```

3.  **Log In**:
    Open `http://localhost:5173` and use:
    - **Username**: `admin`
    - **Password**: `admin123`

I have created a `DataInitializer` class that automatically creates this admin user on startup.
