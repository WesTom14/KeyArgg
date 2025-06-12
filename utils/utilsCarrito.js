function agregarAlCarrito(juego) {
  fetch('/carrito/agregar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(juego),
    credentials: 'include'
  })
  .then(res => {
    if (res.status === 401) {
      alert("Debes iniciar sesión para agregar al carrito.");
      window.location.href = 'IniciarSesion.html';
      return;
    }
    if (res.status === 403) {
      alert("Solo los usuarios compradores pueden usar el carrito.");
      return;
    }
    return res.json();
  })
  .then(data => {
    if (data) {
      alert(data.mensaje);
    }
  })
  .catch(err => {
    console.error("Error al agregar al carrito:", err);
  });
}

// Eliminar juego del carrito por ID (requiere estar logueado)
function eliminarDelCarrito(id) {
  fetch(`/carrito/eliminar/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  .then(res => {
    if (res.status === 401) {
      alert("Debes iniciar sesión.");
      window.location.href = '/login';
      return;
    }
    if (res.status === 403) {
      alert("Solo compradores pueden modificar el carrito.");
      return;
    }
    return res.json();
  })
  .then(data => {
    if (data) {
      alert(data.mensaje);
      window.location.reload();
    }
  })
  .catch(err => {
    console.error("Error al eliminar del carrito:", err);
  });
}

// Exponerlas globalmente
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;

