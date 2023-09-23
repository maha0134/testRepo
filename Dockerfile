# Use an official Node.js runtime as the base image
FROM node:18
RUN mkdir -p /app


# Copy the rest of the application code to the container
COPY emaww.js package.json /app/

# Set the working directory in the container
WORKDIR /app

# Install application dependencies
RUN npm install

# Expose the port your Node.js app will listen on
EXPOSE 8080

# Define the command to start your Node.js app
CMD node emaww.js
