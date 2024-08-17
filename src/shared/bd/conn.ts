import { MongoClient, Db } from 'mongodb'

const connectionStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/'

const usu = new MongoClient(connectionStr)
await usu.connect()

export let dbU: Db = usu.db('LosUsuarios')
export let dbM: Db = usu.db('LasMacotas')
export let dbV: Db = usu.db('LasVeterinarias')
export let dbA: Db = usu.db('LosAntecedentes')
