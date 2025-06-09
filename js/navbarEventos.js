document.addEventListener('DOMContentLoaded', () => {
  const iconoPerfil = document.querySelector('a[title="Perfil de usuario"]');

  if (iconoPerfil) {
    iconoPerfil.addEventListener('click', async (e) => {
      e.preventDefault(); // 👈 evita que el <a> redirija por su cuenta

      try {
        const res = await fetch('http://localhost:3000/api/sesion');
        const data = await res.json();

        if (!data.usuario) {
          // No hay sesión iniciada
          window.location.href = '/html/IniciarSesion.html';
        } else if (data.usuario.rol === 'admin') {
          // Redirigir a panel de administrador
          window.location.href = '/html/Administrador/Admin.html';
        } else {
          // Redirigir a perfil de usuario
          window.location.href = '/html/perfilUsuario.html';
        }

      } catch (error) {
        console.error('Error al verificar sesión:', error);
      }
    });
  }
});
