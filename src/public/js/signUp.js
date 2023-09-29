const socket = io();
const btnForm = document.getElementById('btn-form');
const form = document.getElementById('add-user');

/*const newUser = e => {
	e.preventDefault();
	const data = new FormData(form);
	const user = {
		name: data.get('name'),
		lastName: data.get('lastName'),
		age: data.get('age'),
		email: data.get('email'),
		password: data.get('password'),
	};
	socket.emit('addUser', user);
	form.reset();
};*/

btnForm.addEventListener('click', () => {
	form.submit()
});

socket.on('userExists', () => {
	alert('El email ingresado ya ha sido registrado en la base de datos');
  });