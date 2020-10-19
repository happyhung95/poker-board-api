import { Ledger } from './../types/types'
import { Request, Response, NextFunction } from 'express'

import Game from '../models/Game'
import Transaction from './../models/Transaction'
import { InternalServerError, NotFoundError, InvalidRequestError } from '../helpers/apiError'
import { RequestType, TransactionsRequest } from '../types/types'

//* POST /transactions
export const updateTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gameId, requests = [] } = req.body //! requests is an array

    if (!gameId || requests.length === 0 || !Array.isArray(requests))
      return next(
        new InvalidRequestError(
          "Invalid Request: require 'gameId' and 'requests' in request body, 'requests' must be an array "
        )
      )

    let game = await Game.findById(gameId)
      .exec()
      .catch(e => next(new NotFoundError('Game not found', e)))

    if (!game) return next(new NotFoundError('Game not found'))

    const { players } = game

    let errorCount = 0
    let errorMsg = ''
    let typeErrorMsg = ''

    // can't modify value of player.balance in mongoose object, hence, need to keep a record of balance updates in a ledger
    const ledger: Ledger = []

    // the final balance of players will be updated to database after the loop
    requests.forEach(
      ({ type, ownerId, description, amount, transactionId, refId, counterPartyId }: TransactionsRequest) => {
        const player = players.find(player => player._id == ownerId)
        if (!player) {
          errorCount++
          errorMsg += `Player ${ownerId} not found. `
          return
        }

        const { transactions, balance } = player

        // check if there has been any request from this ownerId before
        const match = ledger.length > 0 && ledger.find(obj => obj.playerId == ownerId)
        const index = match && ledger.findIndex(obj => obj.playerId == ownerId)
        let mostRecentBalance = match ? match.balance : balance

        if (type === RequestType.add) {
          const newTransaction = new Transaction({ ownerId, description, amount, refId, counterPartyId })
          transactions.push(newTransaction)
          mostRecentBalance += amount
        } else if (type === RequestType.remove) {
          const transactionExist = transactions.find(transaction => transaction._id == transactionId)
          if (!transactionExist) {
            errorCount++
            errorMsg += `Transaction (${transactionId}) not found. `
            return
          }

          transactionExist.deleted = true

          const removedTransaction = new Transaction({
            ownerId,
            counterPartyId,
            description: `${description} (removed)`,
            refId,
            amount: -amount,
            deleted: true,
          })

          transactions.push(removedTransaction)
          mostRecentBalance -= amount
        } else {
          errorCount++
          typeErrorMsg += `Require type: 'add' OR 'remove' in request: '${description}'. `
        }

        // add to the ledger if not exists (i.e. this is the first request from this ownerId)
        if (!match) {
          ledger.push({ playerId: ownerId, balance: mostRecentBalance })
        } else {
          // update the ledger if it already exists
          ledger[index as number].balance = mostRecentBalance
        }
      }
    )

    // update transactions to database after addition and/or removal
    await game.save()

    // update the final balance of each player to database
    await Promise.all(
      ledger.map(({ playerId, balance }) =>
        Game.updateOne({ _id: gameId, 'players._id': playerId }, { $set: { 'players.$.balance': balance } }).exec()
      )
    )

    // if error exists, respond with error after saving the successful updates
    if (errorCount !== 0) return next(new InvalidRequestError(`Invalid Request: ${typeErrorMsg} ${errorMsg}`))

    // grab the most recent game object with updated players' balance
    game = await Game.findById(gameId).exec()

    //Trigger all connected user to update data
    const io = req.app.locals.io
    io.emit(`update ${gameId}`, game)

    res.status(201).json(game)
  } catch (error) {
    next(new InternalServerError('Internal Server Error', error))
  }
}
