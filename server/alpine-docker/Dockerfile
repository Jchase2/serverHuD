# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /ServerHuD/server
COPY . .
RUN apk update
RUN apk add postgresql
RUN apk add postgresql-timescaledb
RUN apk add nodejs
RUN npm i -g typescript 
RUN mkdir /run/postgresql
RUN chown postgres:postgres /run/postgresql/
RUN adduser -D serverhud
RUN chown -R serverhud:serverhud /ServerHuD 
USER serverhud
RUN npm i 
RUN tsc
USER postgres
RUN cd ~ && mkdir /var/lib/postgresql/data && chmod 0700 /var/lib/postgresql/data
RUN initdb -D /var/lib/postgresql/data 
RUN echo "shared_preload_libraries = 'timescaledb'" >> /var/lib/postgresql/data/postgresql.conf
EXPOSE 3001
ADD docker.sh /docker.sh
USER root
CMD ["/docker.sh"]