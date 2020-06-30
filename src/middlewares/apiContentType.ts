import { Request, Response, NextFunction } from 'express'

import { InvalidRequestError } from '../helpers/apiError'

export default function (req: Request, res: Response, next: NextFunction) {
  if ((req.method === 'POST' || req.method === 'PUT') && !req.is('application/json')) {
    next(new InvalidRequestError('Please send JSON request body'))
  } else {
    next()
  }
}
