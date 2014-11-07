## How to run the example
This mini tutorial explains how to run the angular example with the laravel API. This is assuming you are serving the API using apache2 on a linux host, moreover, using an ubuntu server. You can use this as a starter point for other OS and distros.



### 1. Clone the repository

Select a path and execute

    git clone https://github.com/auth0/auth0-angular.git

### 2. Configure apache

Configure an apache virtual host pointing to the public folder with `mod_rewrite` enabled and *AllowOverride: all*.

something like this will do

    <VirtualHost *:80>
            DocumentRoot /path-to-gitclone/auth0-angular/examples/api-authentication/laravel/public

            <Directory /path-to-gitclone/auth0-angular/examples/api-authentication/laravel/public/>
                    Options FollowSymLinks MultiViews
                    AllowOverride All
            </Directory>

            ErrorLog ${APACHE_LOG_DIR}/error.log
            LogLevel warn

            CustomLog ${APACHE_LOG_DIR}/access.log combined

    </VirtualHost>

dont forget to restart apache

    service apache2 restart

### 3. Configure Laravel

Set write permissions to the `app/storage` folder

    cd /path-to-gitclone
    chmod -R a+w  app/storage

Update composer

    composer update

### 4. Configure Angular

In order to use the *Auth0 audience and secret* provided in the example, the Angular app must be hosted in [http://localhost:3000](http://localhost:3000), thus making `http://localhost:3000/callback` a valid callback. The *Laravel API* is hosted by apache, probably in a different server/port, for example we use a VM with an ubuntu server.

To connect the client to the backend, we need to configure the angular application. On your localhost, go to the path where you have your `/path-to-gitclone/auth0-angular/examples/api-authentication/client` and edit `myApp.js` pointing to your Apache Web Server

    angular.module('myApp').constant('API_ENDPOINT', 'http://172.16.210.131/api/protected');

Then we need to serve the static files on port *3000*. If you have python installed, you can run

    python  -m SimpleHTTPServer 3000

If not, you can serve them using the node example

    cd /path-to-gitclone/auth0-angular/examples/api-authentication/node
    npm install
    node app.js

### 5. Try it
Go to [http://localhost:3000](http://localhost:3000), log in using a google account, and click on *call a secure API*

## Things to notice

* The file `app/routes.php` contains the actual API endpoint, we use a special filter called `auth-jwt` that will check that the request has an Authorization header with a valid JWT, if it works, you can access the user by calling `Auth0::jwtuser()`, if not the server will reply with a *401* status.

* The key and audience to decode the JWT is stored in `app/config/packages/auth0/login/api.php`.

* Because this will be an API served in a different server than the angular page, we need to activate *CORS*, we do that in `app/filters.php`.

* And most important of all, check `public/.htaccess`, in there we have a special rule that tells apache to pass the Authorization header to PHP, if not you will always get a *401*

    RewriteCond %{HTTP:Authorization} ^(.*)
    RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]

