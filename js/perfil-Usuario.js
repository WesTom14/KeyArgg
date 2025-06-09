localStorage.setItem("isLoggedIn", "true");

document.getElementById("userIcon").addEventListener("click", () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    
    if (isLoggedIn) {
      // Redirigir al perfil
      window.location.href = "../html/perfilUsuario.html";
    } else {
      // Redirigir a la pantalla de registro
      window.location.href = "../html/CrearCuenta.html";
    }
  });