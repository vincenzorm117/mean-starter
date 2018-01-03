#!/bin/sh

USER=myuser
HOSTNAME=example.com
PATH=/some/path/to/directory

rsync -av --delete-after --exclude-from=.stage_exclusions --no-perms -t ./ $USER@$HOSTNAME:$PATH
