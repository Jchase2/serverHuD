# serverHuD
A web based heads up display for servers and websites. Designed by a dev for server admins, website admins, or devs
to monitor their services, servers or websites. It is currently only tested on linux, but additional platforms are
in the works. 

![serverHuD image](https://i.ibb.co/k0qD0gB/serverhudpic.png)
![serverHuD_image_2](https://i.ibb.co/dbbB990/serverhudpic2.png)
## Built With

- Front End: [React](https://reactjs.org/), [Chakra UI](https://chakra-ui.com/), [Axios](https://axios-http.com/)
- Back End: [TimescaleDB](https://www.timescale.com/), [sequelize-typescript](https://www.npmjs.com/package/sequelize-typescript), [NodeJS](https://nodejs.org/en/), [KoA](https://koajs.com/)
- Others: [JWT](https://jwt.io/), [Socket.IO](https://socket.io/)

## Features

### Base Server
* Server status (if the server is reachable or not)
* SSL Status
* Days remaining until SSL expires. 
* http code (200, 500, etc)
* Recorded Uptime
* Recorded Downtime

### Extension Server
* Memory usage over time
* CPU usage over time
* Disk Usage for multiple drives 
* Available upgrades (so far, just for apt based systems, more planned)
* S.M.A.R.T Disk Status 

Some extension server features require you to run it as root. 

## Getting Started

If you'd like to run your own serverHuD instance:

- Install Postgres and TimescaleDB. 
- Copy the .env_example file to .env for the front end and back end, fill in the TimescaleDB information.
- Clone the repo then run:
  - ```cd client && npm i```
  - ```cd ../server && npm i```
- Finally, run the server and client
  - ```cd ../client && npm start```
  - ```cd ../server && npm start```

If you want to use the extension server for additional data, you'll need Go installed on your server. 
Then simply run the go server (preferably with root) and change the .env on the backend to use the address you configure for that server. 
You'll need to point your web server (nginx, apache, whatever) to the server so it's accessible. Highly recommend using a https connection for security. 

## TODO

Please see the serverHuD improvement project to see planned changes:

https://github.com/users/Jchase2/projects/1/views/1

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
