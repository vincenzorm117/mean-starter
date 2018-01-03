#!/bin/bash

DB=mydatabase

cd dbdumps
name=$(date "+%m_%d_%y%___%H_%M_%S-mongo")
mongodump --db $DB --out "$name"
tar cvzf "$name.tgz" $name
rm -rf $name
cd ..
