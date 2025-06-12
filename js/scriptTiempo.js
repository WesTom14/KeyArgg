function iniciarContador() {
  console.log("⏱️ Contador iniciado");

  const duracionSemana = 7 * 24 * 60 * 60 * 1000;
  const ahora = new Date();

  const ultimoLunes = new Date(ahora);
  const dia = ahora.getDay();
  const diferenciaDia = (dia + 6) % 7;
  ultimoLunes.setHours(0, 0, 0, 0);
  ultimoLunes.setDate(ahora.getDate() - diferenciaDia);

  const finOferta = new Date(ultimoLunes.getTime() + duracionSemana);

  function actualizarContador() {
    const ahora = new Date();
    const diferencia = finOferta - ahora;

    if (diferencia <= 0) {
      location.reload();
      return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
    const segundos = Math.floor((diferencia / 1000) % 60);

    document.getElementById("dias").textContent = String(dias).padStart(2, '0');
    document.getElementById("horas").textContent = String(horas).padStart(2, '0');
    document.getElementById("minutos").textContent = String(minutos).padStart(2, '0');
    document.getElementById("segundos").textContent = String(segundos).padStart(2, '0');
  }

  actualizarContador();
  setInterval(actualizarContador, 1000);
}
