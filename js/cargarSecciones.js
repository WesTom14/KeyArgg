console.log("Script de carga de todas las secciones ejecutado.");

// Función genérica para crear cards
function crearCard(juego, clase) {
  const div = document.createElement('div');
  div.className = clase;
  div.style.cursor = 'pointer';

  const img = document.createElement('img');
  img.src = juego.background_image || '../img/placeholder.jpg';
  img.alt = juego.name;

  const info = document.createElement('div');
  info.className = 'info-card';

  const linea = document.createElement('div');
  linea.className = 'info-linea';

  const titulo = document.createElement('p');
  titulo.className = 'titulo';
  titulo.textContent = juego.name;

  linea.appendChild(titulo);

  //  Mostrar precio solo si no es tendencia
  if (clase !== 'juego') {
    const precio = document.createElement('span');
precio.className = 'etiqueta-precio';
precio.textContent = `$${juego.precio}`;
    linea.appendChild(precio);
  }

  info.appendChild(linea);
  div.appendChild(img);
  div.appendChild(info);

  div.addEventListener('click', () => {
    window.location.href = `/html/detalleJuego.html?id=${juego.id}`;
  });

  return div;
}




// Función genérica para cargar juegos en un contenedor
function cargarJuegos(seccionSelector, cantidad, cardClass) {
  fetch('/api/juegos')
    .then(response => response.json())
    .then(data => {
      const juegos = data.results.slice(0, cantidad);
      const contenedor = document.querySelector(seccionSelector);

      if (!contenedor) {
        console.error(`No se encontró el contenedor para ${seccionSelector}`);
        return;
      }

      contenedor.innerHTML = ''; // Limpiar el contenido actual

      juegos.forEach(juego => {
        const card = crearCard(juego, cardClass);
        contenedor.appendChild(card);
      });
    })
    .catch(error => console.error(`Error cargando los juegos en ${seccionSelector}:`, error));
}

function cargarJuegosAleatorios(seccionSelector, cantidad, cardClass) {
  const paginaAleatoria = Math.floor(Math.random() * 50) + 1;  // Hasta 50 páginas
  fetch(`/api/juegos?page_size=40&page=${paginaAleatoria}`)    // Pedimos 40 juegos aleatorios de una página aleatoria
    .then(response => response.json())
    .then(data => {
      let juegos = data.results;

      // Mezclar aleatoriamente y tomar la cantidad deseada
      juegos = juegos.sort(() => 0.5 - Math.random()).slice(0, cantidad);

      const contenedor = document.querySelector(seccionSelector);

      if (!contenedor) {
        console.error(`No se encontró el contenedor para ${seccionSelector}`);
        return;
      }

      contenedor.innerHTML = '';

      juegos.forEach(juego => {
        const card = crearCard(juego, cardClass);
        contenedor.appendChild(card);
      });
    })
    .catch(error => console.error(`Error cargando los juegos en ${seccionSelector}:`, error));
}




// Cargar cada sección
cargarJuegos('.tendencias-grid', 4, 'juego');
cargarJuegos('#seccion-recomendaciones .seccion-juegos-grid', 3, 'card-juego');
cargarJuegosAleatorios('#masvendido .seccion-juegos-grid', 6, 'card-juego');
cargarJuegosAleatorios('.ofertas-juegos', 3, 'card-juego');
