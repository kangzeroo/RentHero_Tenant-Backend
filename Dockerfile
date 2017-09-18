FROM nodesource/trusty:6.3.1

ADD package.json package.json
RUN sudo npm install
ADD . .

EXPOSE 3002

CMD ["npm","run", "prod"]
