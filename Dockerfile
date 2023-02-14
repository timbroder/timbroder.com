FROM node:18-alpine AS app

WORKDIR /app
COPY . .

EXPOSE 8000

RUN apk add --update g++ make python3
# RUN apk add --update --no-cache --repository http://dl-3.alpinelinux.org/alpine/edge/community --repository http://dl-3.alpinelinux.org/alpine/edge/main vips-dev

RUN npm install -g gatsby-cli
#RUN npm install
#RUN yarn import
#RUN npm run develop

EXPOSE 8000

RUN yarn install
RUN yarn develop

EXPOSE 8000
