// register.js

document
  .getElementById("registerForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;

    const userData = {
      username: username,
      password: password,
      email: email,
      firstName: firstName,
      lastName: lastName,
    };

    try {
      const response = await fetch("http://localhost:5104/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        // Başarılı kayıt
        alert("Kayıt başarılı!");
        // İsteğe bağlı: Kullanıcıyı giriş sayfasına yönlendir
        window.location.href = "login.html";
      } else {
        // Kayıt başarısız
        const error = await response.text();
        alert(`Kayıt başarısız: ${error}`);
      }
    } catch (error) {
      console.error("Kayıt sırasında bir hata oluştu:", error);
      alert("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  });
