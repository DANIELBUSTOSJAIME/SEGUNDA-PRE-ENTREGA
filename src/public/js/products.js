const logoutBtn = document.getElementById('logout-btn');

logoutBtn.addEventListener('click', () => {
  fetch('/api/sessions/logout')
    .then(response => {
      if (response.ok) {
        window.location.href = '/login';
      } else {
        console.error('Error al cerrar sesión');
      }
    })
    .catch(error => {
      console.error('Error al cerrar sesión:', error);
    });
});