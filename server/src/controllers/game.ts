import { Request, Response, NextFunction } from 'express'

import Game from '../models/Game'
import { InternalServerError, NotFoundError, InvalidRequestError } from '../helpers/apiError'

//* GET /
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const games = await Game.find().select({ name: 1 }).exec()
    res.status(200).json(games)
  } catch (error) {
    next(new InternalServerError('Internal Server Error', error))
  }
}

//* GET /:gameId
export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.gameId
    const game = await Game.findById(gameId).exec()
    if (!game) return next(new NotFoundError('Game not found'))
    res.status(200).json(game)
  } catch (error) {
    next(new InternalServerError('Internal Server Error', error))
  }
}

//* POST /game
export const createGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, buyIn } = req.body

    if (!name || !buyIn) return next(new InvalidRequestError('Invalid Request: name and buyIn parameter required'))

    const game = new Game({ name, buyIn })

    game.save()

    res.status(201).json(game)
  } catch (error) {
    next(new InternalServerError('Internal Server Error', error))
  }
}

//* DELETE /game
export const deleteGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.gameId

    const deletedGame = Game.findByIdAndDelete(gameId).exec()

    if (!deletedGame) return next(new NotFoundError('Game not found'))

    res.status(204).json()
  } catch (error) {
    next(new InternalServerError('Internal Server Error', error))
  }
}
