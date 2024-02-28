#!/bin/bash
su - postgres << EOF
/usr/lib/postgresql/14/bin/pg_ctl start -D /etc/postgresql/14/main && psql -c "ALTER USER postgres WITH PASSWORD '$DB_PW';"
psql -c "CREATE DATABASE serverhud;"
EOF

su - serverhud << EOF 
cd /ServerHuD/server
node . 
EOF