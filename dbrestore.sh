#!/bin/bash

tarName=$1
name=${tarName%.*}
tar xvf $tarName
mongorestore $name

