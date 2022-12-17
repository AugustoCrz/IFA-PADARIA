const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const ProdutoRoutes = require("./src/api/routes/ProdutoRoute")

const app = express();

//Configuração dos middlewares
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(bodyParser.json())

app.use(ProdutoRoutes)

//Exporta o aplicativo express configurado
module.exports = app;