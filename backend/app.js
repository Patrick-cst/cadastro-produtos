const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const productRoutes = require('./routes/products');

const app = express();
const PORT = 3001;

// Configurações
app.use(cors());
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/products', productRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
    console.log(`Swagger UI disponível em http://localhost:${PORT}/api-docs`);
});