# Use Node.js image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code into the container
COPY . .

# Expose the port for the backend
EXPOSE 3007

# Start the Node.js application
CMD ["node", "index.js"]
