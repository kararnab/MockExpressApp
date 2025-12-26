# Multi-Stage Builds for Production
## Stage 1: Build
FROM node:20 AS build

WORKDIR /app

## Taking advantage of Docker’s layer caching
COPY package*.json ./
RUN npm install --production

COPY . .

## Stage 2: Run
FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm ci --only=production
COPY . .

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["node", "src/index.js"]