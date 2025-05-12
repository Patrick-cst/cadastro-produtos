const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3001; // Alterado para usar a porta do Render

// Configuração do CORS para produção e desenvolvimento
app.use(cors({
  origin: [
    'https://patrick-cst.github.io', // Seu GitHub Pages
    'http://localhost:3000'         // Desenvolvimento local
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/products', productRoutes);

app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
    console.log(`Swagger UI disponível em http://localhost:${PORT}/api-docs`);
});