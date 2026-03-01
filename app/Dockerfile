# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the .env file to the container
COPY .env .env

# Copy the rest of the app
COPY . .

# Expose app port (change if not 3000)
EXPOSE 8080

# Start app
CMD ["node", "app.js"]
