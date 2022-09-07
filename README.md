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
Feel free to use this API at: https://poker-board.herokuapp.com/api/v1

[Poker Board Client](https://pokerboard.netlify.app/)

[Poker Board Client Github](https://github.com/happyhung95/poker-board-client)


### Disclaimer: 
#### All data posted via this API will be publicly available to the world. I do not take responsibility for protecting the published data.

Enjoy!

Helsinki - 30.06.2020
