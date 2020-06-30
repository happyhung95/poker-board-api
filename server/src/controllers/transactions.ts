import { Ledger } from './../types/types'
import { Request, Response, NextFunction } from 'express'

import Game from '../models/Game'
import { PlayerDocument } from './../models/Player'
import Transaction from './../models/Transaction'
import { InternalServerError, NotFoundError, InvalidRequestError } from '../helpers/apiError'
import { RequestType, TransactionsRequest } from '../types/types'

//* POST /transactions
export const updateTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gameId, requests = [] } = req.body //! requests is an array

    if (!gameId || requests.length === 0)
      return next(new InvalidRequestError("Invalid Request: require 'gameId' and 'requests' in request body"))

    let game = await Game.findById(gameId).exec()
    if (!game) return next(new NotFoundError('Game not found'))

    const { players } = game

    let errorCount = 0

    // can't modify value of player.balance in mongoose object, hence, need to keep a record of balance updates in a ledger
    const ledger: Ledger = []

    // the final balance of players will be updated to database after the loop
    requests.forEach(async ({ type, ownerId, counterParty, amount, transactionId }: TransactionsRequest) => {
      const player = players.find(player => player._id == ownerId)
      const { transactions, balance } = player as PlayerDocument

      // check if there has been any request from this ownerId before
      const match = ledger.length > 0 && ledger.find(obj => obj.playerId == ownerId)
      const index = match && ledger.findIndex(obj => obj.playerId == ownerId)
      let mostRecentBalance = match ? match.balance : balance

      if (type === RequestType.add) {
        const newTransaction = new Transaction({ ownerId, counterParty, amount })
        transactions.push(newTransaction)
        mostRecentBalance += amount
      } else if (type === RequestType.remove) {
        // remove transaction from the array
        const removedTransaction = transactions.splice(
          transactions.findIndex(({ _id }) => _id == transactionId),
          1
        )
        mostRecentBalance -= removedTransaction[0].amount
      } else {
        errorCount++
      }
      // add to the ledger if not exists (i.e. this is the first request from this ownerId)
      if (index === false) {
        ledger.push({ playerId: ownerId, balance: mostRecentBalance })
      } else {
        // update the ledger if it already exists
        ledger[index!] = { playerId: ownerId, balance: mostRecentBalance }
      }
    })
    // update transactions to database after addition and/or removal
    await game.save()

    // update the final balance of each player to database
    ledger.forEach(({ playerId, balance }) =>
      Game.updateOne({ _id: gameId, 'players._id': playerId }, { $set: { 'players.$.balance': balance } }).exec()
    )

    // if error exists, respond with error after saving the successful updates
    if (errorCount !== 0)
      return next(
        new InvalidRequestError(`Invalid Request: require type: 'add' OR 'remove' in ${errorCount} 'requests' object`)
      )
    // grab the most recent game object with updated players' balance
    game = await Game.findById(gameId).exec()

    res.status(201).json(game)
  } catch (error) {
    next(new InternalServerError('Internal Server Error', error))
  }
}
