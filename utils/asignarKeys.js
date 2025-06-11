const fs = require('fs');
const path = require('path');
const usuariosPath = path.join(__dirname, '../usuarios.json');
const generarClaveJuego = require('./generarClave');

function asignarKeysAUsuario(req) {
  if (!req.session.usuario || !req.session.carrito) return;

  const email = req.session.usuario.usuario;
  const carrito = req.session.carrito;

  const usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));
  const index = usuarios.findIndex(u => u.usuario === email);
  if (index === -1) return;

  if (!usuarios[index].keys) usuarios[index].keys = [];

  carrito.forEach(juego => {
    usuarios[index].keys.push({
      juegoId: juego.id,
      juego: juego.name,
      key: generarClaveJuego(),
      plataforma: juego.seleccion || 'PC',
      fecha: new Date().toISOString()
    });
  });

  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));

  req.session.carrito = [];
}

module.exports = asignarKeysAUsuario;
