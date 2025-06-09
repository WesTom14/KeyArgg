  const toggleBtn = document.getElementById("toggleFilters");
  const sidebar = document.getElementById("sidebar");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
  });