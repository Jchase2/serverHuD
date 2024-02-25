#/bin/sh
su - postgres << EOF
pg_ctl start -D /var/lib/postgresql/data
psql -c "CREATE DATABASE serverhud;"
EOF
su serverhud
/bin/sh