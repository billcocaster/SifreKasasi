// login.js

document
  .getElementById("loginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const loginData = {
      username: username,
      password: password,
    };

    try {
      const response = await fetch("http://localhost:5104/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const result = await response.json();
        // Token'ı yerel depolamada sakla
        localStorage.setItem("jwtToken", result.token);
        alert("Giriş başarılı!");
        // Şifrelerim sayfasına yönlendir
        window.location.href = "accounts.html";
      } else {
        const error = await response.text();
        alert(`Giriş başarısız: ${error}`);
      }
    } catch (error) {
      console.error("Giriş sırasında bir hata oluştu:", error);
      alert("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  });
