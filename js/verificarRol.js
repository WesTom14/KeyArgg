export function redirigirSiAdmin() {
  fetch('/api/sesion', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.usuario && data.usuario.rol === 'admin') {
        alert("Acceso no permitido. Redirigiendo al panel de administración.");
        window.location.href = "/html/Administrador/Admin.html";
      }
    });
}