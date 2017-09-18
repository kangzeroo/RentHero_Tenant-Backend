FROM nodesource/trusty:6.3.1

RUN mkdir /app
WORKDIR /app
ADD package.json /app
RUN npm install
ADD . /app

EXPOSE 3002

CMD ["npm","run", "prod"]
