# Implementing your own Storage

By defalt, auth0-angular uses `localStorage` if available. If `localStorage` isn't available, it'll use `ngCookies` provided that the `angular-cookies.js` was added and that it was added as a dependency of your app. If you'd prefer to use any other storage service, you just need to implement the `authStorage` service with the following methods:

* **store(idToken, accessToken, state, refreshToken)**: This needs to store the 4 parameters somewhere
* **get()**: This needs to return an object with the `idToken`, `accessToken`, `state` and `refreshToken` fields
* **remove()**: This needs to remove from local storage all the token information.
