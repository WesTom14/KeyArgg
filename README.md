# 🎮 KeyArg - Tienda Virtual de Claves de Videojuegos

Proyecto Final Integrador - Laboratorio III - Diseño I
Universidad del Aconcagua – Licenciatura en Informática y Desarrollo de Software  
Grupo 8: Córdoba Víctor, Tartaglia Juan, Silvestre Ramiro, Romero Ignacio, Weimberg Tomás  

---

## 🚀 Descripción

**KeyArg** es una tienda virtual de claves de videojuegos desarrollada como proyecto integrador full stack. A lo largo de 5 sprints bajo metodología Scrum, se implementaron funcionalidades reales de una plataforma e-commerce: catálogo dinámico, autenticación de usuarios, carrito de compras, pagos seguros con Mercado Pago y un panel de administración.

---

## ✅ Funcionalidades Principales

### 📚 Catálogo de Juegos
- Integración con la API [RAWG](https://rawg.io/apidocs) para obtener juegos populares y en oferta.
- Render dinámico del catálogo.
- Vista de detalles con capturas, descripciones y precios calculados.

### 🔐 Gestión de Usuarios
- Registro e inicio de sesión con sistema de roles (`comprador` / `admin`).
- Edición de perfil y cambio de contraseña.
- Recuperación de contraseña vía email (nodemailer).

### 🛒 Carrito de Compras & Pagos
- Carrito persistente por sesión.
- Resumen automático con subtotal, descuentos y total.
- Checkout real mediante [Mercado Pago Checkout API](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/introduction).
- Generación automática de claves post-compra.

### 🧑‍💼 Panel Administrativo
- CRUD de usuarios y claves.
- Vista protegida solo accesible por administradores.
- Control de claves asociadas a cada usuario.

---

## 💻 Tecnologías Utilizadas

- **Frontend:** HTML, CSS, JavaScript (sin frameworks)
- **Backend:** Node.js + Express
- **APIs externas:**  
  - RAWG (juegos)
  - Mercado Pago (pagos)
  - Nodemailer (emails)
- **Base de datos (modo prueba):** Archivos `.json`
- **Gestión de entorno:** `.env`
- **Control de versiones:** Git + GitHub

---
