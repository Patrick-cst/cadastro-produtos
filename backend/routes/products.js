const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db/products.json');

// Helper para ler dados
const readData = () => {
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
};

// Helper para escrever dados
const writeData = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Gerar ID sequencial
const generateId = (products) => {
    if (products.length === 0) return 1;
    const maxId = Math.max(...products.map(p => p.id));
    return maxId + 1;
};

// Validação de produto
const validateProduct = (product, products, isUpdate = false) => {
    const errors = [];
    
    // Validar nome
    if (!product.name || !/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]+$/.test(product.name)) {
        errors.push('O nome do produto deve conter apenas letras');
    }
    
    // Validar nome duplicado
    const nameExists = products.some(p => 
        p.name.toLowerCase() === product.name.toLowerCase() && 
        (isUpdate ? p.id !== product.id : true)
    );
    if (nameExists) {
        errors.push('Nome do produto já existe');
    }
    
    // Validar preço
    if (!product.price || isNaN(product.price) || product.price <= 0) {
        errors.push('O preço deve ser um número positivo');
    }
    
    // Validar descrição
    if (product.description && !/^[A-Za-z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s.,!?]+$/.test(product.description)) {
        errors.push('A descrição deve conter apenas letras e números');
    }
    
    return errors;
};

// GET todos os produtos
router.get('/', (req, res) => {
    const products = readData();
    res.json(products);
});

// GET produto por ID
router.get('/:id', (req, res) => {
    const products = readData();
    const product = products.find(p => p.id === parseInt(req.params.id));
    
    if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    res.json(product);
});

// POST novo produto
router.post('/', (req, res) => {
    const products = readData();
    const newProduct = {
        id: generateId(products),
        name: req.body.name.trim(),
        price: parseFloat(req.body.price),
        description: req.body.description ? req.body.description.trim() : ''
    };
    
    const validationErrors = validateProduct(newProduct, products);
    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }
    
    products.push(newProduct);
    writeData(products);
    res.status(201).json(newProduct);
});

// PUT atualizar produto
router.put('/:id', (req, res) => {
    const products = readData();
    const productId = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === productId);
    
    if (index === -1) {
        return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    const updatedProduct = {
        id: productId,
        name: req.body.name ? req.body.name.trim() : products[index].name,
        price: req.body.price ? parseFloat(req.body.price) : products[index].price,
        description: req.body.description ? req.body.description.trim() : products[index].description
    };
    
    const validationErrors = validateProduct(updatedProduct, products, true);
    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }
    
    products[index] = updatedProduct;
    writeData(products);
    res.json(updatedProduct);
});

// DELETE produto
router.delete('/:id', (req, res) => {
    const products = readData();
    const filteredProducts = products.filter(p => p.id !== parseInt(req.params.id));
    
    if (products.length === filteredProducts.length) {
        return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    writeData(filteredProducts);
    res.status(204).send();
});

module.exports = router;