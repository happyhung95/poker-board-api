# Poker Board API

This is an API for recording buy-ins, buy-outs, and loans for my Poker nights with friends.

### Technology
* Typescript
* Nodejs, Express
* Mongoose, MongoDb
* Jest (testing)

### API Documentation
https://app.swaggerhub.com/apis-docs/happyhung95/Poker-board/1.0.0

### Real time update:
The server emits a socket event `'update {gameId}'` with the updated game object at every transactions / players update request.

### Use this API
Feel free to use this API at: https://poker-board-api.onrender.com/api/v1

[Poker Board Client](https://pokerboard.netlify.app/) (https://happyhung.fun)

[Poker Board Client Github](https://github.com/happyhung95/poker-board-client)

### Database

This project is configured to use MongoDB. You can run a local instance or use a free Mongo Atlas (recommended). 

The deployed API is currently using Atlas in South East Asia. 

_Note: Database is hardened, IP whitelist needed_

### Start local
```
npm i
npm start
OR
yarn
yarn start
```
Set `.env` with the following
```
MONGODB_URI=<mongo-uri>
MONGODB_URI_LOCAL=<mongo-uri>
# port 3000 is reserved for client
PORT=3001 # api port
NODE_VERSION=16.16.0 # for render.com only
```
### Build and deploy
Currently api is deployed on https://render.com, in South East Asia.

```
# The following is build for render.com
yarn; yarn build

# To build locally
npm run build
```
Check `package.json` for more info

### Disclaimer: 
#### All data posted via this API will be publicly available to the world. I do not take responsibility for protecting the published data.

Enjoy!

Helsinki - 30.06.2020
