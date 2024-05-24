import express from 'express'
import { Usuario } from './usuario.js'
const app = express()

const usuarios= [
  new Usuario(
    'tg55-trg4-t4hg-3rde-uj6t',
    'sofia',
    'coppari',
    'soficoppari@gmail.com',
    123,
    '123',
    ['gato','perro']

  ),
]

app.get('/api/usuarios', (req,res) => {
  res.json(usuarios)

})


app.listen(3000, () => {
  console.log("Server running on http: //localhost:3000/")
})