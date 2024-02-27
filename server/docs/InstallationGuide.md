# ServerHuD Server Installation Guide

## .env configuration

First, you will need to copy the .env_example into a .env file. You can do this by running this command: 

`cp .env_example .env`

Or you can do it manually.

Next, you will need to fill out the .env file. Here is an example of the lines you will need to change: 

```
DATABASE=serverhud
DB_USERNAME=postgres
DB_PW=<your preferred password>
SECRET_KEY=<some random string for security>
EXT_SERVER_SSL=<false if localhost, true if you're using SSL>
```

For email notifications:

```
# SMTP Settings for email notifications.
SMTP_HOST=<Your SMTP server from your provider>
SMTP_PORT=<Your SMPT port from your provider, probably 465>
EMAIL_USERNAME=<email@whatever.com>
EMAIL_PASSWORD=<email password>
FROM_STRING=Server HuD
TO_EMAIL=<email@whatever.com>
```

It is highly recommended that you configure this as not doing so many cause issues if the email notifications option is selected and it's not configured. 

## Installation on Linux

### Steps:
* Install node 18+
* Install and configure Postgres
* Install and configure timescaledb 
* Clone the Repo
* Install typescript globally
* Run npm i
* Run tsc
* Run node server
* Configure your web server (nginx, apache, whatever).

### Commands

Once you have postgres, timescaledb, and node installed, run these commands in the ServerHuD/server directory: 

`npm i -g typescript`

`npm i`

`tsc`

`node .`

### Nginx / Apache Configuration

TODO: Write example configurations for Nginx and/or Apache and/or other web servers. 

## Docker

A Dockerfile and accompanying script are included for a convenient way of deploying the serverHuD backend. This will be published on docker hub in the future. For now, an image will need to be generated manually.

## Building and running the image

Assuming you have docker installed, (currently) the best way to use docker is to change into the server directory and run the following commands: 

To build the image: 

`docker build -t serverhud-server .`

To launch the server:

`docker run -e .env -it -p 127.0.0.1:3001:3001 serverhud-server`

Make sure you're in the server directory when you run these comands, as it relies on the dockerfile and script. Feel free to open an issue if you run into problems.