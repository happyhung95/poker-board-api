export enum RequestType {
  add = 'add',
  remove = 'remove',
}

export type PlayersRequest = {
  type: RequestType
  playerId: string | null
  name: string
}

export type TransactionsRequest = {
  type: RequestType
  ownerId: string
  counterParty: string
  amount: number
  transactionId: string | null
}

export type Ledger = PlayerBalance[] 

type PlayerBalance = {
  playerId: string
  balance: number
}
