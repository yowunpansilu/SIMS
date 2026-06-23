FROM python:3.11-slim
WORKDIR /app

# Install the required mysql driver
RUN pip install mysql-connector-python

# Copy the seed script
COPY seed_data.py .

# Run the script against the database container
CMD ["python", "seed_data.py", "--host", "db", "--user", "Yowun", "--password", "admin123"]
