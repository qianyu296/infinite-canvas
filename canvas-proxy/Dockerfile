FROM node:22-alpine

WORKDIR /app
COPY package.json index.js ./

EXPOSE 23210
CMD ["node", "index.js", "--host", "0.0.0.0", "--port", "23210"]
