const socket = io();
socket.on('products', cart => {
    const cartContainer = document.getElementById('cart-container');
    cartContainer.innerHTML = '';
    for (const prod of cart.products) {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
            <h2>${prod.id_prod.title}</h2>
            <p>${prod.id_prod.description}</p>
            <p>Precio: ${prod.id_prod.price}</p>
            <p>Cantidad: ${prod.quantity}</p>
        `;
        cartContainer.appendChild(productDiv);
    }
});