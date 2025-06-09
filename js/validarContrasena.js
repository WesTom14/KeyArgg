function validatePassword() {
  const password = document.getElementById("password").value;
  const length = document.getElementById("length");
  const special = document.getElementById("special");
  const number = document.getElementById("number");
  const lower = document.getElementById("lower");
  const upper = document.getElementById("upper");

  length.className = password.length >= 8 && password.length <= 70 ? "valid" : "invalid";
  special.className = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/\d]/.test(password) ? "valid" : "invalid";
  number.className = /\d/.test(password) ? "valid" : "invalid";
  lower.className = /[a-z]/.test(password) ? "valid" : "invalid";
  upper.className = /[A-Z]/.test(password) ? "valid" : "invalid";
}