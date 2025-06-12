document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("catalogo-grid");
  const paginador = document.getElementById("paginacion");
  const cantidadTexto = document.getElementById("cantidad-juegos");
  const pageSize = 20;
  let currentPage = 1;
  let currentFiltros = {
    platform: null,
    genres: null, //  debe ser un array para multiples pero rawg no tiene AND solo OR
    ordering: null,
  };

  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get("search");

  //guardo busquedas desde fuera de catalago.html
  if (searchParam) {
    currentFiltros.search = searchParam;
  }

  // mapeos de nombre plataforma
  function obtenerNombrePlataforma(id) {
    const plataformas = {
      4: "PC",
      187: "PlayStation 5",
      18: "PlayStation 4",
      186: "Xbox Series X",
      1: "Xbox One",
    };
    return plataformas[id] || "Plataforma";
  }
  //mapeo nombre genero
  function obtenerNombreGenero(slug) {
    const generos = {
      action: "Acción",
      adventure: "Aventura",
      "role-playing-games-rpg": "RPG",
      shooter: "Shooter",
      sports: "Deportes",
      racing: "Carreras",
    };
    return generos[slug] || "Género";
  }

  // Cargar plataformas desde RAWG
  function cargarPlataformas() {
    try {
      const plataformas = [
        { id: 4, name: "PC" },
        { id: 187, name: "PlayStation 5" },
        { id: 18, name: "PlayStation 4" },
        { id: 186, name: "Xbox Series X" },
        { id: 1, name: "Xbox One" },
      ];
      const lista = document.getElementById("filtro-plataformas");
      plataformas.forEach((p) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="#" data-id="${p.id}" class="hover:underline">${p.name}</a>`;
        li.querySelector("a").addEventListener("click", (e) => {
          e.preventDefault();
          currentFiltros.platform = p.id;
          cargarJuegos(1);
        });
        lista.appendChild(li);
      });
    } catch (err) {
      console.error("Error cargando plataformas:", err);
    }
  }

  // Cargar géneros desde RAWG
  function cargarGeneros() {
    try {
      const generos = [
        { slug: "action", name: "Acción" },
        { slug: "adventure", name: "Aventura" },
        { slug: "role-playing-games-rpg", name: "RPG" },
        { slug: "shooter", name: "Shooter" },
        { slug: "sports", name: "Deportes" },
        { slug: "racing", name: "Carreras" },
      ];

      const lista = document.getElementById("filtro-generos");
      generos.forEach((g) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="#" data-id="${g.slug}" class="hover:underline">${g.name}</a>`;
        li.querySelector("a").addEventListener("click", (e) => {
          e.preventDefault();
          currentFiltros.genre = g.slug; // solo uno
          cargarJuegos(1);
        });

        lista.appendChild(li);
      });
    } catch (err) {
      console.error("Error cargando géneros:", err);
    }
  }

  //cargo juegos
  async function cargarJuegos(pagina = 1) {
    try {
      let url = `http://localhost:3000/api/juegos?page=${pagina}&page_size=${pageSize}`;

      if (currentFiltros.platform) {
        url += `&platforms=${currentFiltros.platform}`;
      }

      //la api no me deja filtrar x multiples generos en modo AND
      /* if (currentFiltros.genres.length > 0) {
     url += `&genres=${currentFiltros.genres.join(',')}`;
      } */

      if (currentFiltros.genre) {
        url += `&genres=${currentFiltros.genre}`;
      }

      if (currentFiltros.search) {
        url += `&search=${encodeURIComponent(currentFiltros.search)}`;
      }

      if (currentFiltros.ordering) {
        url += `&ordering=${currentFiltros.ordering}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      const juegos = data.results;

      // Actualizar texto de cantidad
      if (cantidadTexto) {
        cantidadTexto.textContent = `Se encontraron ${data.count} productos`;
      }

      // Limpiar contenedor y renderizar juegos
      contenedor.innerHTML = "";
      juegos.forEach((juego) => {
        const div = document.createElement("div");
        div.className =
          "border rounded shadow-sm p-2 transition hover:scale-105 hover:shadow-md duration-300";

        div.innerHTML = `
          <img src="${juego.background_image}" alt="${
          juego.name
        }" class="w-full h-48 object-cover rounded">
          <h3 class="text-base font-semibold mt-2">${juego.name}</h3>
          <p class="text-sm text-gray-500 mb-2">${juego.slug.replace(
            /-/g,
            " "
          )}</p>
          <div class="flex items-center justify-between">
            <span class="text-teal-600 font-bold">$${juego.precio}</span>
            <button class="text-gray-400 hover:text-blue-600 transition" onclick="agregarAlCarrito({
              id: ${juego.id},
              name: \`${juego.name}\`,
              precio: ${juego.precio},
              imagen: '${juego.background_image}',
              plataformas: ['PC']
            })">🛒</button>
          </div>
        `;

        div.style.cursor = "pointer";

        // Hacer que todo el div sea clickeable, salvo el botón del carrito
        div.addEventListener("click", (e) => {
          // Evito que el botón de carrito dispare la redirección
          if (!e.target.closest("button")) {
            window.location.href = `/html/detalleJuego.html?id=${juego.id}`;
          }
        });

        contenedor.appendChild(div);
      });

      // Generar paginación
      generarPaginacion(data.count, pagina);
      //Muestro filtros
      actualizarFiltrosActivos();
    } catch (error) {
      console.error("Error al cargar juegos:", error);
    }
  }

  //muestro el filtro activo
  function actualizarFiltrosActivos() {
    const contenedor = document.getElementById("filtros-activos");
    contenedor.innerHTML = "";

    // Plataforma
    if (currentFiltros.platform) {
      const nombrePlataforma = obtenerNombrePlataforma(currentFiltros.platform);
      const btn = document.createElement("button");
      btn.className =
        "bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded";
      btn.textContent = `${nombrePlataforma} ✕`;
      btn.onclick = () => {
        currentFiltros.platform = null;
        cargarJuegos(1);
      };
      contenedor.appendChild(btn);
    }

    // Género
    if (currentFiltros.genre) {
      const nombreGenero = obtenerNombreGenero(currentFiltros.genre);
      const btn = document.createElement("button");
      btn.className =
        "bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded";
      btn.textContent = `${nombreGenero} ✕`;
      btn.onclick = () => {
        currentFiltros.genre = null;
        cargarJuegos(1);
      };
      contenedor.appendChild(btn);
    }

    //busqueda x nombre
    if (currentFiltros.search) {
      const btn = document.createElement("button");
      btn.className =
        "bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded";
      btn.textContent = `${currentFiltros.search} ✕`;
      btn.onclick = () => {
        currentFiltros.search = null;
        actualizarFiltrosActivos();
        cargarJuegos(1);
      };
      contenedor.appendChild(btn);
    }
  }

  function generarPaginacion(total, paginaActual) {
    const totalPaginas = Math.ceil(total / pageSize);
    paginador.innerHTML = "";

    const crearBoton = (i, label = null) => {
      const btn = document.createElement("button");
      btn.textContent = label || i;
      btn.className = `px-3 py-1 mx-1 rounded border ${
        i === paginaActual
          ? "bg-blue-700 text-white"
          : "bg-white text-blue-700 hover:bg-blue-100"
      }`;
      btn.addEventListener("click", () => {
        currentPage = i;
        cargarJuegos(currentPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      paginador.appendChild(btn);
    };

    // Primera página
    if (paginaActual > 1) {
      crearBoton(paginaActual - 1, "Anterior");
    }

    for (
      let i = Math.max(1, paginaActual - 2);
      i <= Math.min(totalPaginas, paginaActual + 2);
      i++
    ) {
      crearBoton(i);
    }

    if (paginaActual < totalPaginas) {
      crearBoton(paginaActual + 1, "Siguiente");
    }
  }

  // Busqueda
  const inputBusqueda = document.getElementById("input-busqueda");
  const botonBuscar = document.getElementById("boton-buscar");

  if (inputBusqueda && botonBuscar) {
    botonBuscar.addEventListener("click", () => {
      const termino = inputBusqueda.value.trim();

      currentFiltros.search = termino;

      // Limpiar otros filtros al buscar por nombre
      currentFiltros.platform = null;
      currentFiltros.genre = null;
      currentFiltros.ordering = null;

      actualizarFiltrosActivos();
      cargarJuegos(1);
    });

    inputBusqueda.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const termino = inputBusqueda.value.trim();

        currentFiltros.search = termino;

        currentFiltros.platform = null;
        currentFiltros.genre = null;
        currentFiltros.ordering = null;

        actualizarFiltrosActivos();
        cargarJuegos(1);
      }
    });
  }

  // Inicializo
  cargarJuegos(currentPage);
  cargarPlataformas();
  cargarGeneros();
});
