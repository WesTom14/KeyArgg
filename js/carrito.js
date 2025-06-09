document.addEventListener('DOMContentLoaded', async () => {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contenedorCarrito = document.getElementById('items-carrito');
  const totalElemento = document.getElementById('total-carrito');
  const vacioMsg = document.getElementById('carrito-vacio');

  // 1. Mostrar juegos en el carrito
  if (carrito.length === 0) {
    vacioMsg.classList.remove('hidden');
    totalElemento.textContent = '$0';

  } else {
    vacioMsg.classList.add('hidden');
    let total = 0;

    carrito.forEach(juego => {
      total += juego.precio;

      const div = document.createElement('div');
      div.className = 'bg-white p-4 rounded-lg shadow flex justify-between items-center';

      // Si no tiene plataformas, agregamos una por defecto
      const plataformas = juego.plataformas || ['PC (Steam)'];

      div.innerHTML = `
        <div class="flex items-center gap-4">
          <img src="${juego.imagen}" alt="${juego.name}" class="w-20 h-14 rounded object-cover"/>
          <div>
            <p class="font-semibold text-base">${juego.name}</p>
            <select class="text-sm text-gray-700 border rounded px-2 py-1 mt-1">
              ${plataformas.map(p => `<option>${p}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="text-right">
          <p class="font-bold text-sm text-black">$${juego.precio}</p>
          <button class="text-red-600 text-sm hover:underline eliminar-item" data-id="${juego.id}">Eliminar</button>
        </div>
      `;

      contenedorCarrito.appendChild(div);
    });

    totalElemento.textContent = `$${total}`;

    // Calcular resumen
    const precioOficial = total;
    const descuento = Math.round(precioOficial * 0.3); //probando un descuento del 0.30%
    const subtotal = precioOficial - descuento;

    document.getElementById('precio-oficial').textContent = `$${precioOficial}`;
    document.getElementById('descuento').textContent = `-$${descuento}`;
    document.getElementById('total-carrito').textContent = `$${subtotal}`;

  }

  // 2. Escuchar clics en "Eliminar"
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('eliminar-item')) {
      const id = e.target.dataset.id;
      let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      carrito = carrito.filter(j => j.id != id);
      localStorage.setItem('carrito', JSON.stringify(carrito));
      location.reload();
    }
  });

  // 3. Cargar recomendaciones
  const contenedorRecomendaciones = document.getElementById('recomendaciones-carrito');

  try {
    const res = await fetch('http://localhost:3000/api/juegos?page_size=3');
    const data = await res.json();
    const juegos = data.results;

    juegos.forEach(juego => {
      const div = document.createElement('div');
      div.className = "bg-white p-4 rounded-lg shadow flex justify-between items-center";

      const plataformas = juego.platforms
        ? juego.platforms.map(p => p.platform.name)
        : ['PC (Steam)'];

      const estructuraHTML = `
        <div class="flex items-center gap-4">
          <img src="${juego.background_image}" alt="${juego.name}" class="w-20 h-14 rounded object-cover"/>
          <div>
            <p class="font-semibold text-base">${juego.name}</p>
            <select class="text-sm text-gray-700 border rounded px-2 py-1 mt-1">
              ${plataformas.map(p => `<option>${p}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="text-right">
          <p class="font-bold text-sm text-black">$${juego.precio}</p>
          <a href="#" class="agregar-carrito text-blue-600 text-sm hover:underline" data-id="${juego.id}">Agregar a la cesta</a>
        </div>
      `;

      div.innerHTML = estructuraHTML;
      contenedorRecomendaciones.appendChild(div);

        // Botón funcional
        const boton = div.querySelector('.agregar-carrito');
    boton.addEventListener('click', (e) => {
  e.preventDefault();
  agregarAlCarrito({
    id: juego.id,
    name: juego.name,
    precio: juego.precio,
    imagen: juego.background_image,
    plataformas: plataformas
  });

  //  Recargar la página
  window.location.reload();
});
 });
    } catch (err) {
        console.error('Error al cargar recomendaciones:', err);
    }
    });
