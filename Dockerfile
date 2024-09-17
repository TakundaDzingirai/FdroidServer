FROM registry.gitlab.com/fdroid/fdroidserver:buildserver

COPY signing-key.asc /

RUN gpg --import /signing-key.asc

RUN . /etc/profile.d/bsenv.sh \
	&& git clone --depth 1 https://gitlab.com/fdroid/fdroidserver.git "${fdroidserver}"

# Install Nginx and other utilities required by actual builds
RUN . /etc/profile.d/bsenv.sh \
	&& apt-get update \
	&& apt-get install --yes \
		patch \
		autoconf \
		libtool \
		pkg-config \
		ant \
		nginx \
	&& echo y | sdkmanager "build-tools;32.0.0" \
	&& apt-get clean && rm -rf /var/lib/apt/lists/*

# Create the necessary directory for the F-Droid repo to avoid 404 errors
RUN mkdir -p /var/www/html/repo

# Copy the modified Nginx configuration file into the container
COPY default /etc/nginx/sites-available/default

# Ensure Nginx config is correctly linked to sites-enabled
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Copy the F-Droid repository from your local machine to the container
COPY repo/. /var/www/html/repo/

EXPOSE 80 443


# Start Nginx and the F-Droid server using a script to handle the two processes
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]

