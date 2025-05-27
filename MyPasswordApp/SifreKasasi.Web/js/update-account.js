// update-account.js

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Giriş yapmanız gerekiyor.");
    window.location.href = "login.html";
    return;
  }

  // URL'den hesap ID'sini al
  const urlParams = new URLSearchParams(window.location.search);
  const accountId = urlParams.get("id");

  if (!accountId) {
    alert("Güncellenecek hesap belirtilmedi.");
    window.location.href = "accounts.html";
    return;
  }

  const siteNameInput = document.getElementById("siteName");
  const siteUsernameInput = document.getElementById("siteUsername");
  const passwordInput = document.getElementById("password");
  const accountIdInput = document.getElementById("accountId");

  accountIdInput.value = accountId; // Gizli alana ID'yi set et

  // Mevcut hesap bilgilerini API'den çek ve formu doldur (şifre hariç)
  try {
    const response = await fetch(
      `http://localhost:5104/api/Account/${accountId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const account = await response.json();
      siteNameInput.value = account.siteName;
      siteUsernameInput.value = account.siteUsername;
      // Şifreyi güvenlik nedeniyle çekip formu doldurmuyoruz.
    } else if (response.status === 401) {
      alert("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
      localStorage.removeItem("jwtToken");
      window.location.href = "login.html";
    } else if (response.status === 404) {
      alert("Güncellenecek hesap bulunamadı.");
      window.location.href = "accounts.html";
    } else {
      const error = await response.text();
      alert(`Hesap bilgileri yüklenirken hata oluştu: ${error}`);
    }
  } catch (error) {
    console.error("Hesap bilgileri yüklenirken bir hata oluştu:", error);
    alert(
      "Hesap bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin."
    );
  }

  // Form gönderildiğinde güncelleme işlemini yap
  document
    .getElementById("updateAccountForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const updatedAccountData = {
        id: parseInt(accountId), // ID'yi tamsayı olarak gönder
        siteName: siteNameInput.value,
        siteUsername: siteUsernameInput.value,
        password: passwordInput.value, // Şifre alanı boşsa gönderilmeyecek veya API tarafında kontrol edilecek
      };

      // Şifre alanı boşsa password property'sini objeden kaldır
      if (updatedAccountData.password === "") {
        delete updatedAccountData.password;
      }

      try {
        const response = await fetch(
          `http://localhost:5104/api/Account/${accountId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedAccountData),
          }
        );

        if (response.ok) {
          alert("Şifre başarıyla güncellendi!");
          window.location.href = "accounts.html"; // Şifrelerim sayfasına yönlendir
        } else if (response.status === 401) {
          alert("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
          localStorage.removeItem("jwtToken");
          window.location.href = "login.html";
        } else if (response.status === 404) {
          alert("Güncellenecek şifre bulunamadı.");
        } else {
          const error = await response.text();
          alert(`Şifre güncelleme başarısız: ${error}`);
        }
      } catch (error) {
        console.error("Şifre güncelleme sırasında bir hata oluştu:", error);
        alert(
          "Şifre güncelleme sırasında bir hata oluştu. Lütfen tekrar deneyin."
        );
      }
    });
});
