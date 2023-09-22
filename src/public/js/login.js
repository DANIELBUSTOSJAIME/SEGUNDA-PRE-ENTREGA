  const socket = io();
  const btnForm = document.getElementById('btn-form');
  const form = document.getElementById('login-user');
  
  btnForm.addEventListener('click', () => {
    form.submit();
  });
  
  socket.on('loginError', () => {
    alert("Usuario o contraseña incorrectos");
  });