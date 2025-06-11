function protegerIconoCarrito() {
  const icono = document.getElementById('icono-carrito');
  if (!icono) return;

  icono.addEventListener('click', (e) => {
    e.preventDefault();

    fetch('/api/sesion', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (!data.usuario) {
          alert("Debes iniciar sesión para acceder al carrito.");
          window.location.href = "/html/IniciarSesion.html";
        } else if (data.usuario.rol !== 'comprador') {
          alert("Solo los compradores pueden acceder al carrito.");
        } else {
          window.location.href = "/html/carrito.html";
        }
      })
      .catch(err => console.error("Error al verificar sesión:", err));
  });
}

window.protegerIconoCarrito = protegerIconoCarrito;
