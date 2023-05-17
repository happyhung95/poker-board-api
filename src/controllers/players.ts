import { Request, Response, NextFunction } from 'express'

import Game from '../models/Game'
import Player from './../models/Player'
import Transaction from './../models/Transaction'
import { InternalServerError, NotFoundError, InvalidRequestError } from '../helpers/apiError'
import { RequestType, PlayersRequest } from '../types/types'

//* POST /players
export const updatePlayers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gameId, requests = [] } = req.body //! requests is an array

    if (!gameId || requests.length === 0 || !Array.isArray(requests))
      return next(
        new InvalidRequestError(
          "Invalid Request: gameId and requests parameters required, 'requests' must be an array. "
        )
      )

    const game = await Game.findById(gameId)
      .exec()
      .catch(e => next(new NotFoundError('Game not found', e)))

    if (!game) return next(new NotFoundError('Game not found'))

    const { players } = game

    let errorCount = 0
    let errorMsg = ''
    let typeErrorMsg = ''

    requests.forEach(({ type, playerId: requestPlayerId, name }: PlayersRequest) => {
      if (type === RequestType.add) {
        if (!name) {
          errorCount++
          errorMsg += 'Name required to create Player'
          return
        }

        // add player
        const newPlayer = new Player({ name })
        const buyIn = new Transaction({
          ownerId: newPlayer._id,
          description: 'Buy-in',
          amount: -game.buyIn,
          refId: 'buyIn',
          counterPartyId: null,
        })

        // add buyIn transaction by default
        newPlayer.transactions.push(buyIn)
        newPlayer.balance -= game.buyIn

        players.push(newPlayer)
      } else if (type === RequestType.remove) {
        const player = players.find(player => player._id == requestPlayerId)

        if (!player) {
          errorMsg += `Player ${name} (ID: ${requestPlayerId}) not found. `
          errorCount++
        } else if (player.balance != 0) {
          errorMsg += `Cannot delete player ${player.name}. Balance is not 0. `
          errorCount++
        } else {
          // remove player from players array  if balance === 0
          players.splice(
            players.findIndex(player => player._id == requestPlayerId),
            1
          )
        }
      } else {
        typeErrorMsg = "Require type: 'add' OR 'remove' in 'requests' object."
      }
    })

    // update players to database after addition and/or removal
    game.save()

    // if error exists, respond with error after saving the successful updates
    if (errorCount !== 0) return next(new InvalidRequestError(`Invalid Request: ${typeErrorMsg} ${errorMsg}`))

    res.status(201).json(game)
  } catch (error) {
    // next(new InternalServerError('Internal Server Error', error))
  }
}
