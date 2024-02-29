FROM ubuntu:latest

WORKDIR /ServerHuD/server
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
COPY . .
RUN apt-get update && apt-get -y upgrade && apt-get -y install ca-certificates curl wget gnupg sudo lsb-release
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get -y install postgresql
RUN apt-get install -y postgresql-client
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs
RUN /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y
RUN echo "deb https://packagecloud.io/timescale/timescaledb/ubuntu/ $(lsb_release -c -s) main" | tee /etc/apt/sources.list.d/timescaledb.list
RUN wget --quiet -O - https://packagecloud.io/timescale/timescaledb/gpgkey | sudo apt-key add -
RUN apt update
RUN apt install -y timescaledb-2-postgresql-14
RUN useradd -ms /bin/bash serverhud
RUN chown -R serverhud:serverhud /ServerHuD
RUN echo "shared_preload_libraries = 'timescaledb'" >> /etc/postgresql/14/main/postgresql.conf
RUN npm i -g typescript
USER serverhud
RUN npm i
RUN tsc
USER root
COPY serverhud_docker.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/serverhud_docker.sh