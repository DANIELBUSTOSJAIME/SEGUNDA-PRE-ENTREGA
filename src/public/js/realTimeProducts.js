const socket = io();

const btnForm = document.getElementById('btn-form');
const form = document.getElementById('add-prod');
const deleteForm = document.getElementById('deleteForm')

const newProd = e => {
	e.preventDefault();
	const data = new FormData(form);
	const prod = {
		title: data.get('title'),
		description: data.get('description'),
		category: data.get('category'),
		price: data.get('price'),
		code: Number(data.get('code')),
		stock: data.get('stock')
	};
	socket.emit('addProd', prod);
	socket.emit('update-products');
	form.reset();
};

deleteForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const code = deleteForm.elements["code"].value;
    await socket.emit('delete-product', { code: code })
    await socket.emit('update-products');
    e.target.reset()
})

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
        	</div>
		`;
	}
});

btnForm.addEventListener('click', newProd);