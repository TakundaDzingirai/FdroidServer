#!/bin/bash

# Start Nginx
nginx

# Source the environment variables
. /etc/profile.d/bsenv.sh

# Run the fdroid server command (you need to specify a command here, like update or deploy)
GRADLE_USER_HOME=${home_vagrant}/.gradle ${fdroidserver}/fdroid update

# Keep the container running
tail -f /dev/null

