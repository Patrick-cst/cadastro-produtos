document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const productList = document.getElementById('productList');
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const productForm = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    const productIdInput = document.getElementById('productId');
    const productNameInput = document.getElementById('productName');
    const productPriceInput = document.getElementById('productPrice');
    const productDescriptionInput = document.getElementById('productDescription');

    // Configuração dinâmica da API
    const API_URL = window.location.hostname === 'patrick-cst.github.io' 
        ? 'https://cadastro-produtos-rc75.onrender.com/api/products' 
        : 'http://localhost:3001/api/products';

    console.log('Modo:', window.location.hostname === 'patrick-cst.github.io' ? 'Produção' : 'Desenvolvimento');
    console.log('API URL:', API_URL);

    // Carregar produtos ao iniciar
    fetchProducts();

    // Event Listeners
    addProductBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', () => closeModal());
    productForm.addEventListener('submit', handleFormSubmit);

    // Validação em tempo real
    productNameInput.addEventListener('input', (e) => {
        if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]*$/.test(e.target.value)) {
            e.target.value = e.target.value.slice(0, -1);
        }
    });

    productPriceInput.addEventListener('input', (e) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        
        if (parts.length > 2) {
            e.target.value = parts[0] + '.' + parts.slice(1).join('');
        } else {
            e.target.value = value;
        }
    });

    productDescriptionInput.addEventListener('input', (e) => {
        if (!/^[A-Za-z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s.,!?]*$/.test(e.target.value)) {
            e.target.value = e.target.value.slice(0, -1);
        }
    });

    // Funções principais
    async function fetchProducts() {
        try {
            console.log('Buscando produtos de:', API_URL);
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro na resposta:', errorText);
                throw new Error('Erro ao carregar produtos');
            }
            
            const products = await response.json();
            console.log('Produtos recebidos:', products);
            renderProducts(products);
        } catch (error) {
            console.error('Erro completo:', error);
            showError('Erro ao carregar produtos. Tente recarregar a página.');
        }
    }

    function renderProducts(products) {
        productList.innerHTML = '';
        
        if (products.length === 0) {
            productList.innerHTML = '<p class="empty-message">Nenhum produto cadastrado.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <i class="fas fa-box-open fa-3x"></i>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">R$ ${product.price.toFixed(2)}</p>
                    <p class="product-description">${product.description || 'Sem descrição'}</p>
                    <div class="product-actions">
                        <button class="btn-edit" data-id="${product.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-delete" data-id="${product.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
            
            productList.appendChild(productCard);
        });

        // Adicionar eventos aos botões
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editProduct(btn.dataset.id));
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
        });
    }

    function openModal(product = null) {
        if (product) {
            modalTitle.textContent = 'Editar Produto';
            productIdInput.value = product.id;
            productNameInput.value = product.name;
            productPriceInput.value = product.price;
            productDescriptionInput.value = product.description || '';
        } else {
            modalTitle.textContent = 'Adicionar Novo Produto';
            productForm.reset();
            productIdInput.value = '';
        }
        productModal.style.display = 'flex';
    }

    function closeModal() {
        productModal.style.display = 'none';
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const productData = {
            name: productNameInput.value.trim(),
            price: parseFloat(productPriceInput.value),
            description: productDescriptionInput.value.trim()
        };

        const productId = productIdInput.value;
        let response;

        try {
            if (productId) {
                // Edição
                response = await fetch(`${API_URL}/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productData)
                });
            } else {
                // Novo produto
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productData)
                });
            }

            const result = await response.json();

            if (response.ok) {
                closeModal();
                fetchProducts();
            } else if (result.errors) {
                showError(result.errors.join('<br>'));
            } else {
                throw new Error(result.message || 'Erro desconhecido');
            }
        } catch (error) {
            console.error('Erro no formulário:', error);
            showError(error.message || 'Ocorreu um erro ao salvar o produto');
        }
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = message;
        
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        productForm.prepend(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    async function editProduct(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            if (!response.ok) throw new Error('Produto não encontrado');
            const product = await response.json();
            openModal(product);
        } catch (error) {
            console.error('Erro ao editar:', error);
            showError('Erro ao carregar produto para edição');
        }
    }

    async function deleteProduct(id) {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchProducts();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao excluir produto');
            }
        } catch (error) {
            console.error('Erro ao excluir:', error);
            showError(error.message);
        }
    }

    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeModal();
        }
    });
});