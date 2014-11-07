# Refresh tokens

Mostly when building mobile apps, we want to show the signin page only once and then leave the user logged in forever. For those cases, it makes sense to have a `refreshToken`. A `refreshToken` lets us get a new `id_token` or `JWT` anytime we want. 

> **Warning**: This means that if the `refreshToken` gets compromised, unless we revoke that token, somebody would be able to get a new JWT forever.

In order to be able to get this feature, all we need to do is to send the option `offline_mode: true` when calling the `signin` or `signup`.

````js
auth.signin({
  offline_mode: true
});
````

> **Warning**: The `refreshToken` gets saved in the whatever is implemented in [Auth Storage](custom-storage.md), which by default is a client cookie. Be aware that if this is a security concern for you, never ask for the `refreshToken`.

