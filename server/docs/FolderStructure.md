# Server Structure

The server stores the DB and acts as the engine for the app generally. This is the primary server for ServerHuD (as opposed to the extension server). This is written in Node with Typescript. All folders discussed in this section can be assumed to be under src/ 

## Controllers 

The Controllers directory contains the API and sockets for the app, handles communications with the models, deals with the router's requests, etc. 

## Models 

Database models are stored here. For now, this uses the sequelize-typescript package from npm. 

Sockets are based in this folder as well, using socket-io. 

## Router 

This is the folder that contains the routes file. 

## Utils 

This is a general folder that is used for pretty much anything that doesn't fit in the other folders cleanly. It contains nodemailer for email alerts, cronUtils functions, api utilities, jwt utilities, and other utils. 

