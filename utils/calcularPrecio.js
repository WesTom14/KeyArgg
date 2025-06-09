function calcularPrecio(juego) {
  let base = 5000;

  const anio = juego.released ? new Date(juego.released).getFullYear() : 2020;
  const ahora = new Date().getFullYear();
  const antiguedad = ahora - anio;
  base -= antiguedad * 300;

  if (juego.rating > 4) base += 2000;
  else if (juego.rating > 3) base += 1000;

  return Math.max(1500, base);
}