// save-account.js

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    // Token yoksa giriş sayfasına yönlendir
    alert("Giriş yapmanız gerekiyor.");
    window.location.href = "login.html";
    return;
  }

  document
    .getElementById("saveAccountForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const siteName = document.getElementById("siteName").value;
      const siteUsername = document.getElementById("siteUsername").value;
      const password = document.getElementById("password").value;

      const accountData = {
        siteName: siteName,
        siteUsername: siteUsername,
        password: password,
      };

      try {
        const response = await fetch("http://localhost:5104/api/Account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(accountData),
        });

        if (response.ok) {
          alert("Şifre başarıyla kaydedildi!");
          window.location.href = "accounts.html"; // Şifrelerim sayfasına yönlendir
        } else if (response.status === 401) {
          // Token geçersiz veya süresi dolmuş
          alert("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
          localStorage.removeItem("jwtToken"); // Geçersiz token'ı sil
          window.location.href = "login.html";
        } else {
          const error = await response.text();
          alert(`Şifre kaydetme başarısız: ${error}`);
        }
      } catch (error) {
        console.error("Şifre kaydetme sırasında bir hata oluştu:", error);
        alert(
          "Şifre kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyin."
        );
      }
    });
});
