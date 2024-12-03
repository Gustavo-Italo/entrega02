const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path;
    }

    async getProducts() {
        try {
            if (!fs.existsSync(this.path)) {
                return []; 
            }
            const data = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Erro ao ler o arquivo:", error);
            return [];
        }
    }

    async saveProducts(products) {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        } catch (error) {
            console.error("Erro ao salvar o arquivo:", error);
        }
    }

    async addProduct(product) {
        try {
            const products = await this.getProducts();

            if (!product.title || !product.description || !product.price || !product.thumbnail || !product.code || product.stock === undefined) {
                console.error("Erro: Todos os campos são obrigatórios.");
                return;
            }

            if (products.some(p => p.code === product.code)) {
                console.error(`Erro: O código "${product.code}" já existe.`);
                return;
            }

            const newProduct = {
                id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
                ...product
            };

            products.push(newProduct);
            await this.saveProducts(products);
            console.log("Produto adicionado com sucesso:", newProduct);
        } catch (error) {
            console.error("Erro ao adicionar o produto:", error);
        }
    }

    async getProductById(id) {
        try {
            const products = await this.getProducts();
            const product = products.find(p => p.id === id);
            if (!product) {
                console.error("Erro: Produto não encontrado.");
                return null;
            }
            return product;
        } catch (error) {
            console.error("Erro ao buscar o produto:", error);
            return null;
        }
    }

    
    async updateProduct(id, updatedFields) {
        try {
            const products = await this.getProducts();
            const productIndex = products.findIndex(p => p.id === id);

            if (productIndex === -1) {
                console.error("Erro: Produto não encontrado.");
                return;
            }

        
            products[productIndex] = { ...products[productIndex], ...updatedFields, id };
            await this.saveProducts(products);
            console.log("Produto atualizado com sucesso:", products[productIndex]);
        } catch (error) {
            console.error("Erro ao atualizar o produto:", error);
        }
    }

   
    async deleteProduct(id) {
        try {
            const products = await this.getProducts();
            const filteredProducts = products.filter(p => p.id !== id);

            if (products.length === filteredProducts.length) {
                console.error("Erro: Produto não encontrado.");
                return;
            }

            await this.saveProducts(filteredProducts);
            console.log(`Produto com ID ${id} removido com sucesso.`);
        } catch (error) {
            console.error("Erro ao remover o produto:", error);
        }
    }
}

module.exports = ProductManager;


(async () => {
    const manager = new ProductManager('./products.json');
    await manager.addProduct({
        title: "Produto 1",
        descrição: "Descrição do Produto 1",
        preço: 100,
        code: "PROD1",
        estoque: 10
    });

    await manager.addProduct({
        title: "Produto 2",
        descrição: "Descrição do Produto 2",
        preço: 200,
        code: "PROD2",
        estoque: 5
    });


    console.log("Todos os produtos:", await manager.getProducts());

    console.log("Produto com ID 1:", await manager.getProductById(1));

    await manager.updateProduct(1, { price: 150, stock: 20 });

    await manager.deleteProduct(2);

    console.log("Produtos atualizados:", await manager.getProducts());
})();
