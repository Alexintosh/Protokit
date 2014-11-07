<?php

Route::get('/api/protected', array('before'=>'auth-jwt', function() {
    return "Hello " . Auth0::jwtuser()->name . " this is the Laravel API";
}));



