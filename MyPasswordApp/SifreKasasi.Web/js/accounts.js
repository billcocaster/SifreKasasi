// accounts.js

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwtToken");
  const accountsListDiv = document.getElementById("accountsList");

  if (!token) {
    // Token yoksa giriş sayfasına yönlendir
    alert("Giriş yapmanız gerekiyor.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:5104/api/Account", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const accounts = await response.json();
      accountsListDiv.innerHTML = ""; // Yükleniyor mesajını kaldır

      if (accounts.length === 0) {
        accountsListDiv.innerHTML = "<p>Henüz kaydedilmiş şifreniz yok.</p>";
      } else {
        const ul = document.createElement("ul");
        accounts.forEach((account) => {
          const li = document.createElement("li");
          li.textContent = `Site: ${account.siteName}, Kullanıcı Adı: ${account.siteUsername}`;
          ul.appendChild(li);
        });
        accountsListDiv.appendChild(ul);
      }
    } else if (response.status === 401) {
      // Token geçersiz veya süresi dolmuş
      alert("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
      localStorage.removeItem("jwtToken"); // Geçersiz token'ı sil
      window.location.href = "login.html";
    } else {
      const error = await response.text();
      accountsListDiv.innerHTML = `<p>Şifreler yüklenirken hata oluştu: ${error}</p>`;
    }
  } catch (error) {
    console.error("Şifreler yüklenirken bir hata oluştu:", error);
    accountsListDiv.innerHTML =
      "<p>Şifreler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.</p>";
  }
});
