import express from 'express'

import { getAll, getOne, createGame, deleteGame, updatePlayers, updateTransactions } from '../controllers'

const router = express.Router()

// Every path we define here will get /api/v1/ prefix
router.get('/', getAll)
router.get('/:gameId', getOne)
router.post('/game', createGame)
router.delete('/game/:gameId', deleteGame)
router.post('/players', updatePlayers)
router.post('/transactions', updateTransactions)

export default router
