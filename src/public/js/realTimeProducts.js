const socket = io();
const btnForm = document.getElementById('btn-form');
const form = document.getElementById('add-prod');
const deleteForm = document.getElementById('deleteForm');
const updateForm = document.getElementById('update-products');

const newProd = e => {
	e.preventDefault();
	const data = new FormData(form);
	const prod = {
		title: data.get('title'),
		description: data.get('description'),
		category: data.get('category'),
		price: data.get('price'),
		code: data.get('code'),
		stock: data.get('stock'),
		_id: data.get('_id')
	};
	socket.emit('addProd', prod);
	form.reset();
};

updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const _id = updateForm.elements._id.value;
    const title = updateForm.elements.title.value;
    const description = updateForm.elements.description.value;
    const price = updateForm.elements.price.value;
    const code = updateForm.elements.code.value;
    const stock = updateForm.elements.stock.value;
	const status = updateForm.elements.status.value;
    await socket.emit('update-products', { _id: _id, title: title, description: description, price: price, code: code, stock: stock, status: status });
    e.target.reset();
});

deleteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const _id = deleteForm.elements._id.value;
    await socket.emit('delete-product', { _id: _id });
    e.target.reset();
});

socket.on('products', products => {
	const productsContainer = document.getElementById('products-container');
	productsContainer.innerHTML = '';
	for (const prod of products.reverse()) {
		productsContainer.innerHTML += `
			<div>
            	<h2>${prod.title}</h2>
            	<p><b>Descripción:</b> ${prod.description}</p>
            	<p><b>Categoría:</b> ${prod.category}</p>
            	<p><b>Precio: $</b>${prod.price}</p>
            	<p><b>Código:</b> ${prod.code}</p>
            	<p><b>Stock:</b> ${prod.stock}</p>
				<p><b>ID:</b> ${prod._id}</p>
        	</div>
		`;
	}
});

btnForm.addEventListener('click', newProd);