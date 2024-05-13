FROM node:13.12.0-alpine
ENV NODE_ENV=production

WORKDIR /app

ENV PATH /app/node_modules/.bin/:$PATH


COPY package.json /.
COPY package-lock.json /.
RUN npm install 

COPY . ./ 

EXPOSE 3000

