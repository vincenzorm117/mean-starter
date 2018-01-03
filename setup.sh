exit


USER=myuser
PASS=1234567890 # Generate with: echo -n "password" | openssl sha1
GROUP=purplecobras
HOSTNAME=example.com


# Setup non-root admin user

adduser $USER
usermod -aG sudo $USER

# Setup Public Key-based authentication

# Setup firewall
sudo ufw app list
sudo ufw allow OpenSSH
sudo ufw enable
#######################################
# This will reboot the droplet
sudo shutdown -r now
#######################################
sudo ufw status






# Install Node.js
curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt-get install nodejs


# Test node installation
cat > test.js <<EOL
#!/usr/bin/env nodejs
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(8080);
console.log('Server running at http://localhost:8080/');
console.log('Try: curl http://localhost:8080');
console.log('Try: curl http://troals.com:8080');
EOL

chmod +x ./test.js
./test.js







# Setup and Configure MongoDB

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-get update

sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl status mongodb

# Setup mongo user
cat | mongo <<EOL
db.createUser({ 
    "user": "myMongoUser", 
    "pwd": "password", 
    "roles": [{ 
        "db": "myDB", 
        "role": "readWrite"
    }]  
});
EOL






# Setup and Configure Redis

sudo apt-get update
sudo apt-get install build-essential tcl
cd /tmp
curl -O http://download.redis.io/redis-stable.tar.gz
tar xzvf redis-stable.tar.gz
cd redis-stable
make
make test
sudo make install

sudo mkdir /etc/redis
sudo cp /tmp/redis-stable/redis.conf /etc/redis

# Setup startup script and config for redis
sudo cat > /etc/systemd/system/redis.service <<EOL
[Unit]
Description=Redis In-Memory Data Store
After=network.target

[Service]
User=redis
Group=redis
ExecStart=/usr/local/bin/redis-server /etc/redis/redis.conf
ExecStop=/usr/local/bin/redis-cli shutdown
Restart=always

[Install]
WantedBy=multi-user.target
EOL

sudo adduser --system --group --no-create-home redis
sudo mkdir /var/lib/redis
sudo chown redis:redis /var/lib/redis
sudo chmod 770 /var/lib/redis

# Start redis
sudo systemctl start redis

sudo systemctl enable redis




# Setup rsync config
sudo groupadd $GROUP
sudo adduser $USER $GROUP





# Setup PM2 for process management
sudo npm install -g pm2
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER
systemctl status pm2-$USER

# Enable pm2 to use port 80 and 443
sudo apt-get install authbind
sudo touch /etc/authbind/byport/80
sudo chown $USER /etc/authbind/byport/80
sudo chmod 755 /etc/authbind/byport/80
sudo touch /etc/authbind/byport/443
sudo chown $USER /etc/authbind/byport/443
sudo chmod 755 /etc/authbind/byport/443

authbind --deep pm2 update

# To start server: 
# authbind --deep pm2 start server

# To stop server
# pm2 delete server





# Setup SSL with letsencrypt and certbot
sudo apt-get install letsencrypt
letsencrypt --webroot -w ./static -d $HOSTNAME

sudo chown -R $USER /etc/letsencrypt
sudo chgrp -R $GROUP /etc/letsencrypt

# To test if ssl renewal is working
# letsencrypt renew
