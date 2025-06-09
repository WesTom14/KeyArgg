function agregarAlCarrito(juego) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  if (!carrito.find(item => item.id === juego.id)) {
    carrito.push({
      id: juego.id,
      name: juego.name,
      precio: juego.precio,
      imagen: juego.imagen || juego.background_image,
      plataformas: juego.plataformas || ["PC (Steam)"] // si no vienen, al menos una por defecto
    });
    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`${juego.name} fue agregado al carrito`);
  } else {
    alert(`${juego.name} ya está en el carrito`);
  }
}

// Función de utilidad por si necesitás eliminar uno (puede agregarse)
function eliminarDelCarrito(id) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito = carrito.filter(item => item.id != id);
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Exponerlas globalmente
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
