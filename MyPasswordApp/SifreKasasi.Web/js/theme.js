document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;
  const currentTheme = localStorage.getItem("theme") || "light";

  // Sayfa yüklendiğinde temayı uygula
  body.classList.add(currentTheme + "-mode");

  themeToggle.addEventListener("click", () => {
    // Mevcut temayı değiştir
    if (body.classList.contains("light-mode")) {
      body.classList.replace("light-mode", "dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.replace("dark-mode", "light-mode");
      localStorage.setItem("theme", "light");
    }
  });
});
