This is an alternative docker config using alpine linux for those who prefer alpine over Ubuntu.

The default docker image uses ubuntu base. Alpine's timescaledb is slightly out of date (as of 2/25/2024),
it's also the apache license version that lacks some features. So keep that in mind. 

If you want to use this, delete the Dockerfile in the server directory, move docker.sh and Docker into 
the server directory, and run `docker build -t serverhud-server .`

Once the build completes, run something like: `docker run -it -p 127.0.0.1:3001:3001 serverhud-server` for a local instance. 