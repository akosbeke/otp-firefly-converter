FROM node:20-alpine
RUN mkdir -p /usr/code/app
WORKDIR /usr/code/app
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "run", "start"]
