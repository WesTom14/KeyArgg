function generarClaveJuego() {
  const segmentos = [];
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < 3; i++) {
    let segmento = '';
    for (let j = 0; j < 5; j++) {
      segmento += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    segmentos.push(segmento);
  }

  return segmentos.join('-');
}

module.exports = generarClaveJuego;
