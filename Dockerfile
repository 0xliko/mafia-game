FROM node:14

WORKDIR /usr/src/app

ENV PORT 8080
ENV HOST 0.0.0.0

COPY ./package*.json ./
COPY ./.env ./.env

COPY ./ . 

RUN npm install 
# RUN npm run obfuscator

RUN mkdir ./bin/logs
RUN touch ./bin/logs/requests.txt
RUN touch ./bin/logs/unhandledRejection.txt

CMD npm start