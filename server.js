const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();
const fs = require('fs');
const usuariosPath = path.join(__dirname, 'usuarios.json');
const nodemailer = require('nodemailer');
//utils
const calcularPrecio = require('./utils/calcularPrecio');
const asignarKeysAUsuario = require('./utils/asignarKeys');

const app = express();
const PORT = 3000;

app.use(session({
  secret: 'keyarg-secret',
  resave: false,
  saveUninitialized: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function verificarSesion(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión para continuar.' });
  }
  next();
}


app.get('/api/sesion', (req, res) => {
  if (req.session.usuario) {
    const usuarios = JSON.parse(fs.readFileSync('./usuarios.json', 'utf-8'));
    const usuarioCompleto = usuarios.find(u => u.usuario === req.session.usuario.usuario);
    res.json({ usuario: usuarioCompleto });
  } else {
    res.json({ usuario: null });
  }
});

app.post('/api/login', (req, res) => {
  const { usuario, password } = req.body;

  const data = fs.readFileSync('./usuarios.json', 'utf-8');
  const usuarios = JSON.parse(data);

  const encontrado = usuarios.find(u => u.usuario === usuario && u.password === password);

  if (encontrado) {
    req.session.usuario = { usuario: encontrado.usuario, rol: encontrado.rol };
    res.json({ mensaje: 'Login exitoso', usuario: req.session.usuario });
  } else {
    res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'No se pudo cerrar la sesión' });
    }
    res.clearCookie('connect.sid'); // Limpia la cookie de sesión
    res.json({ mensaje: 'Sesión cerrada correctamente' });
  });
});

// Ruta para obtener datos completos del usuario logueado
app.get('/api/usuario/:email', (req, res) => {
  const email = req.params.email;
  const usuarios = JSON.parse(fs.readFileSync('./usuarios.json', 'utf-8'));
  const encontrado = usuarios.find(u => u.usuario === email);

  if (encontrado) {
    const { password, ...sinPassword } = encontrado; // Ocultamos la contraseña
    res.json(sinPassword);
  } else {
    res.status(404).json({ error: 'Usuario no encontrado' });
  }
});

app.put('/api/usuario/:email', (req, res) => {
  const email = req.params.email;
  const { nombreCompleto, nombreUsuario, provincia, fechaNacimiento } = req.body;

  try {
    const usuarios = JSON.parse(fs.readFileSync('./usuarios.json', 'utf-8'));
    const index = usuarios.findIndex(u => u.usuario === email);

    if (index === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar los campos
    usuarios[index].nombreCompleto = nombreCompleto;
    usuarios[index].nombreUsuario = nombreUsuario;
    usuarios[index].provincia = provincia;
    usuarios[index].fechaNacimiento = fechaNacimiento;

    // Guardar el archivo
    fs.writeFileSync('./usuarios.json', JSON.stringify(usuarios, null, 2));

    res.json({ mensaje: 'Datos actualizados correctamente' });
  } catch (err) {
    console.error('Error al guardar cambios:', err);
    res.status(500).json({ error: 'Error al guardar los datos' });
  }
});

app.post('/api/cambiar-contrasena', (req, res) => {
  const { actualPassword, nuevaPassword } = req.body;

  // Validar sesión
  if (!req.session.usuario || !req.session.usuario.usuario) {
    return res.status(401).json({ mensaje: 'No has iniciado sesión' });
  }

  const correo = req.session.usuario.usuario;
  const rol = req.session.usuario.rol;

  // Leer usuarios
  fs.readFile(usuariosPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer usuarios.json', err);
      return res.status(500).json({ mensaje: 'Error interno al leer usuarios' });
    }

    let usuarios;
    try {
      usuarios = JSON.parse(data);
    } catch (parseErr) {
      console.error('Error al parsear usuarios.json', parseErr);
      return res.status(500).json({ mensaje: 'Error en el formato del archivo de usuarios' });
    }

    const index = usuarios.findIndex(u => u.usuario === correo && u.rol === rol);

    if (index === -1) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = usuarios[index];

    if (usuario.password !== actualPassword) {
      return res.status(400).json({ mensaje: 'La contraseña actual es incorrecta' });
    }

    // Actualizar contraseña
    usuario.password = nuevaPassword;

    fs.writeFile(usuariosPath, JSON.stringify(usuarios, null, 2), (err) => {
      if (err) {
        console.error('Error al escribir usuarios.json', err);
        return res.status(500).json({ mensaje: 'No se pudo guardar la nueva contraseña' });
      }

      res.json({ mensaje: 'Contraseña actualizada correctamente' });
    });
  });
});

app.post('/api/registro', (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
  }

  fs.readFile(usuariosPath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error al leer usuarios.json:', err);
      return res.status(500).json({ mensaje: 'Error al acceder a la base de usuarios' });
    }

    let usuarios = [];
    try {
      usuarios = JSON.parse(data);
    } catch (parseError) {
      console.error('Error al parsear usuarios.json:', parseError);
      return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }

    const yaExiste = usuarios.some(u => u.usuario === usuario);

    if (yaExiste) {
      return res.status(409).json({ mensaje: 'Ya existe una cuenta con este correo' });
    }

    const nuevoUsuario = {
      usuario,
      password,
      rol: 'comprador',
      nombreCompleto: '',
      nombreUsuario: '',
      provincia: '',
      fechaNacimiento: ''
    };

    usuarios.push(nuevoUsuario);

    fs.writeFile(usuariosPath, JSON.stringify(usuarios, null, 2), (err) => {
      if (err) {
        console.error('Error al guardar nuevo usuario:', err);
        return res.status(500).json({ mensaje: 'No se pudo guardar el usuario' });
      }

      req.session.usuario = {
        usuario: nuevoUsuario.usuario,
        rol: nuevoUsuario.rol
      };

      res.status(201).json({ mensaje: 'Registro exitoso', usuario: req.session.usuario });
    });
  });
});

app.post('/api/enviar-correo-recuperacion', (req, res) => {
  const { email } = req.body;

  fs.readFile(usuariosPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error leyendo usuarios.json');
      return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }

    const usuarios = JSON.parse(data);
    const usuario = usuarios.find(u => u.usuario === email);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Correo no encontrado' });
    }

    // Crear transporte de correo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: email,
  subject: 'Recuperación de contraseña - KeyArg',
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Hola ${usuario.nombreUsuario || ''},</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña en <strong>KeyArg</strong>.</p>
      <p>Si fuiste vos, hacé clic en el botón de abajo para crear una nueva contraseña:</p>
      <a href="http://localhost:3000/html/establecerNuevaContra.html?email=${encodeURIComponent(email)}"
         style="display: inline-block; padding: 10px 20px; margin: 15px 0; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
        Restablecer contraseña
      </a>
      <p>Si no fuiste vos, podés ignorar este correo. Tu contraseña actual seguirá funcionando.</p>
      <p style="font-size: 0.9em; color: #888;">Este enlace es válido por un tiempo limitado.</p>
      <br>
      <p>Atentamente,<br><strong>El equipo de KeyArg</strong></p>
    </div>
  `
};

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo:', error);
        return res.status(500).json({ mensaje: 'No se pudo enviar el correo' });
      }

      res.json({ mensaje: 'Correo enviado con éxito' });
    });
  });
});

app.post('/api/recuperar-contrasena', (req, res) => {
  const { email, nuevaPassword } = req.body;

  if (!email || !nuevaPassword) {
    return res.status(400).json({ mensaje: 'Faltan datos' });
  }

  const usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));
  const index = usuarios.findIndex(u => u.usuario === email);

  if (index === -1) {
    return res.status(404).json({ mensaje: 'Correo no encontrado' });
  }

  usuarios[index].password = nuevaPassword;

  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
  res.json({ mensaje: 'Contraseña actualizada' });
});

app.use(cors());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Ruta para devolver home.html en la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'home.html'));
});

app.post('/carrito/agregar', (req, res) => {
  const user = req.session.usuario;

  if (!user) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión para agregar al carrito.' });
  }

  if (user.rol !== 'comprador') {
    return res.status(403).json({ mensaje: 'Solo compradores pueden usar el carrito.' });
  }

  const juego = req.body;

  if (!req.session.carrito) {
    req.session.carrito = [];
  }

  req.session.carrito.push(juego);

  res.json({ mensaje: 'Juego añadido al carrito.' });
});

app.delete('/carrito/eliminar/:id', (req, res) => {
  const user = req.session.usuario;

  if (!user) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión.' });
  }

  if (user.rol !== 'comprador') {
    return res.status(403).json({ mensaje: 'Solo compradores pueden modificar el carrito.' });
  }

  const juegoId = req.params.id;

  if (!req.session.carrito) {
    return res.status(400).json({ mensaje: 'El carrito está vacío.' });
  }

  req.session.carrito = req.session.carrito.filter(j => j.id != juegoId);

  res.json({ mensaje: 'Juego eliminado del carrito.' });
});

app.get('/carrito', (req, res) => {
  const user = req.session.usuario;

  if (!user) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión.' });
  }

  if (user.rol !== 'comprador') {
    return res.status(403).json({ mensaje: 'Solo los usuarios compradores pueden ver el carrito.' });
  }

  res.json({ carrito: req.session.carrito || [] });
});

app.post('/api/test-generar-keys', (req, res) => {
  if (!req.session.usuario || req.session.usuario.rol !== 'comprador') {
    return res.status(401).json({ mensaje: 'No autorizado' });
  }

  asignarKeysAUsuario(req);

  res.json({ mensaje: 'Keys generadas correctamente', usuario: req.session.usuario.usuario });
});



// Ruta para obtener juegos desde RAWG con control de page y page_size
app.get('/api/juegos', async (req, res) => {
  const pageSize = req.query.page_size || 6;  // Por defecto 6
  const page = req.query.page || 1;          // Por defecto página 1

  try {
    const response = await axios.get('https://api.rawg.io/api/games', {
      params: {
        key: process.env.RAWG_API_KEY,
        page_size: pageSize,
        page: page
      }
    });
    const juegosConPrecio = response.data.results.map(juego => ({...juego,precio: calcularPrecio(juego)}));
     res.json({ ...response.data, results: juegosConPrecio });
  } catch (error) {
    console.error('Error al obtener los juegos:', error);
    res.status(500).json({ error: 'Error al obtener los juegos' });
  }
});

// Ruta para obtener un juego por ID
app.get('/api/juego/:id', async (req, res) => {
  const gameId = req.params.id;

  try {
    const response = await axios.get(`https://api.rawg.io/api/games/${gameId}`, {
      params: { key: process.env.RAWG_API_KEY }
    });

    const juego = response.data;
    juego.precio = calcularPrecio(juego);

     res.json(juego);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el juego' });
  }
});

// Ruta para obtener screenshots por ID de juego
app.get('/api/juego/:id/screenshots', async (req, res) => {
  const gameId = req.params.id;

  try {
    const response = await axios.get(`https://api.rawg.io/api/games/${gameId}/screenshots`, {
      params: { key: process.env.RAWG_API_KEY }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las screenshots' });
  }
});

app.get('/api/estadisticas', (req, res) => {
  const data = JSON.parse(fs.readFileSync('./usuarios.json', 'utf-8'));
  const totalCompras = data.reduce((total, u) => total + (u.keys?.length || 0), 0);
  res.json({ totalCompras });
});

app.get('/api/usuarios', (req, res) => {
  const usuarios = JSON.parse(fs.readFileSync('./usuarios.json', 'utf-8'));
  const sinPasswords = usuarios.map(({ password, ...rest }) => rest);
  res.json(sinPasswords);
});

app.put('/api/usuario/:email/key/:key', (req, res) => {
  const { email, key } = req.params;
  const { nuevaKey } = req.body;

  const usuarios = JSON.parse(fs.readFileSync('./usuarios.json', 'utf-8'));
  const usuario = usuarios.find(u => u.usuario === email);

  if (!usuario || !usuario.keys) return res.status(404).json({ mensaje: 'Usuario o key no encontrada' });

  const keyObj = usuario.keys.find(k => k.key === key);
  if (!keyObj) return res.status(404).json({ mensaje: 'Key no encontrada' });

  keyObj.key = nuevaKey;

  fs.writeFileSync('./usuarios.json', JSON.stringify(usuarios, null, 2));
  res.json({ mensaje: 'Key modificada' });
});

app.delete('/api/usuario/:email/key/:key', (req, res) => {
  const { email, key } = req.params;

  const usuarios = JSON.parse(fs.readFileSync('./usuarios.json', 'utf-8'));
  const usuario = usuarios.find(u => u.usuario === email);

  if (!usuario || !usuario.keys) return res.status(404).json({ mensaje: 'Usuario o key no encontrada' });

  usuario.keys = usuario.keys.filter(k => k.key !== key);

  fs.writeFileSync('./usuarios.json', JSON.stringify(usuarios, null, 2));
  res.json({ mensaje: 'Key eliminada' });
});

app.get('/api/info-dashboard', (req, res) => {
  const fs = require('fs');
  const usuarios = JSON.parse(fs.readFileSync('./usuarios.json', 'utf-8'));

  const allKeys = usuarios.flatMap(u => u.keys || []);

  // Calcular cuántos juegos tienen menos de 3 claves
  const stockMap = {};
  allKeys.forEach(k => {
    const clave = `${k.juego} - ${k.plataforma}`;
    stockMap[clave] = (stockMap[clave] || 0) + 1;
  });

  const stockBajo = Object.values(stockMap).filter(cantidad => cantidad < 3).length;

  // Última venta
  const ultima = allKeys.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];

  res.json({
    stockBajo,
    ultimaVenta: ultima ? `${ultima.juego} (${ultima.plataforma})` : 'Sin ventas'
  });
});




// Levantar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
