const socket = io()

const botonChat = document.getElementById('botonChat')
const valInput = document.getElementById('chatBox')
const parrafosMensajes = document.getElementById('parrafosMensajes')

let email

Swal.fire({
    title: "Identificación de usuario",
    text: "Ingrese su email",
    input: "text",
    inputValidator: (valor => {
        return !valor &&  "Ingrese su email valido"
    }),
    allowOutsideClick: false
}).then(resultado => {
    email = resultado.value
    console.log(email)
})

botonChat.addEventListener('click', () => {
    if(valInput.value.trim().length > 0){
        socket.emit('add-message', {email: email, mensaje: valInput.value })
        valInput.value = ""
    }
})

socket.on('show-messages', (arrayMensajes) => {
    parrafosMensajes.innerHTML = ""
    const reversedMensajes = arrayMensajes.reverse();

    reversedMensajes.forEach(mensaje => {
        parrafosMensajes.innerHTML += `
        <div class="card mt-3">
            <div class="card-header">
                <span class="badge badge-primary text-dark">${mensaje.postTime}</span> <i class="fas fa-user-circle"></i> ${mensaje.email}
            </div>
            <div class="card-body">
                <p class="card-text">${mensaje.message}</p>
            </div>
        </div>`;
    });
})