FROM node:latest
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD node server.js > /logs/coldEmail
EXPOSE 3000
