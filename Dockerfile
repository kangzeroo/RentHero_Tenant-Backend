FROM nodesource/trusty:6.3.1

ADD . .

EXPOSE 3002

CMD ["npm","run", "prod"]
