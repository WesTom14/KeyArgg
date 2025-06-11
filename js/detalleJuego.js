document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('id');

  if (!gameId) return;

  try {
    const res = await fetch(`http://localhost:3000/api/juego/${gameId}`);
    const juego = await res.json();

    // Render básico
    document.getElementById('titulo-juego').textContent = juego.name;
    document.getElementById('precio-juego').textContent = `$${juego.precio}`;
    document.getElementById('hero-juego').style.backgroundImage = `url('${juego.background_image}')`;

    // Descripción
    const descripcion = juego.description_raw || 'Sin descripción disponible.';
    const descCont = document.getElementById('descripcion-juego');
    descCont.innerHTML = descripcion.split('\n').map(p => `<p>${p}</p>`).join('');

    // 🔄 Cargar plataformas sin duplicados
    const selector = document.getElementById('plataforma-selector');
    selector.innerHTML = '';
    const plataformas = juego.platforms
      ? [...new Set(juego.platforms.map(p => p.platform.name))]
      : ['PC (Steam)'];

    plataformas.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      selector.appendChild(opt);
    });

    // ✅ Agregar al carrito
    const btn = document.getElementById('btn-agregar-carrito');
    btn.addEventListener('click', () => {
      const seleccion = selector.value;
      
      agregarAlCarrito({
        id: juego.id,
        name: juego.name,
        precio: juego.precio,
        imagen: juego.background_image,
        plataformas: plataformas,
        seleccion: seleccion
      });
    });

  } catch (err) {
    console.error('Error al cargar el detalle del juego:', err);
  }
});
