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

  // Şifreyi gösterme fonksiyonu
  async function showPassword(accountId, passwordDisplayElement) {
    try {
      const response = await fetch(
        `http://localhost:5104/api/Account/${accountId}/decrypt`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        passwordDisplayElement.textContent = `Şifre: ${result.password}`;
      } else if (response.status === 401) {
        alert("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
        localStorage.removeItem("jwtToken");
        window.location.href = "login.html";
      } else {
        const error = await response.text();
        passwordDisplayElement.textContent = `Şifre çözülürken hata oluştu: ${error}`;
      }
    } catch (error) {
      console.error("Şifre çözülürken bir hata oluştu:", error);
      passwordDisplayElement.textContent = "Şifre çözülürken bir hata oluştu.";
    }
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

          // Bilgi kısmı
          const accountInfo = document.createElement("div");
          accountInfo.className = "account-info";
          accountInfo.innerHTML = `<strong>${account.siteName}</strong><br><span class='account-username'>Kullanıcı Adı: ${account.siteUsername}</span>`;

          // Butonlar ve şifre alanı için bir alt satır
          const actionsDiv = document.createElement("div");
          actionsDiv.className = "account-actions";

          const showPasswordButton = document.createElement("button");
          showPasswordButton.textContent = "Şifreyi Göster";
          showPasswordButton.classList.add("show-password");
          showPasswordButton.setAttribute("data-account-id", account.id);

          const hidePasswordButton = document.createElement("button");
          hidePasswordButton.textContent = "Şifreyi Gizle";
          hidePasswordButton.classList.add("hide-password");
          hidePasswordButton.style.display = "none";

          const passwordDisplay = document.createElement("span");
          passwordDisplay.classList.add("password-display");

          const updateButton = document.createElement("button");
          updateButton.textContent = "Güncelle";
          updateButton.classList.add("update-account");
          updateButton.dataset.accountId = account.id;

          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Sil";
          deleteButton.classList.add("delete-account");
          deleteButton.dataset.accountId = account.id;

          actionsDiv.appendChild(showPasswordButton);
          actionsDiv.appendChild(hidePasswordButton);
          actionsDiv.appendChild(passwordDisplay);
          actionsDiv.appendChild(updateButton);
          actionsDiv.appendChild(deleteButton);

          li.appendChild(accountInfo);
          li.appendChild(actionsDiv);
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

  // Tüm hesap listesine tıklama olayını ekle
  accountsListDiv.addEventListener("click", (event) => {
    if (event.target.classList.contains("show-password")) {
      const accountId = event.target.getAttribute("data-account-id");
      const actionsDiv = event.target.parentElement;
      const passwordDisplayElement =
        actionsDiv.querySelector(".password-display");
      const hidePasswordButton = actionsDiv.querySelector(".hide-password");
      showPassword(accountId, passwordDisplayElement).then(() => {
        event.target.style.display = "none";
        hidePasswordButton.style.display = "inline-block";
      });
    } else if (event.target.classList.contains("hide-password")) {
      const actionsDiv = event.target.parentElement;
      const showPasswordButton = actionsDiv.querySelector(".show-password");
      const passwordDisplayElement =
        actionsDiv.querySelector(".password-display");
      passwordDisplayElement.textContent = "";
      event.target.style.display = "none";
      showPasswordButton.style.display = "inline-block";
    } else if (event.target.classList.contains("update-account")) {
      const accountId = event.target.dataset.accountId;
      console.log("Güncelle butonuna tıklandı. Hesap ID:", accountId);
      // Güncelleme sayfasına yönlendir (ID ile)
      window.location.href = `update-account.html?id=${accountId}`;
    } else if (event.target.classList.contains("delete-account")) {
      const accountId = event.target.dataset.accountId;
      console.log("Sil butonuna tıklandı. Hesap ID:", accountId);
      // Silme işlemini onayla ve yap
      if (confirm("Bu şifreyi silmek istediğinizden emin misiniz?")) {
        deleteAccount(accountId, event.target.closest("li")); // API çağrısı ve listeden silme
      }
    }
  });
});

// Silme işlemi fonksiyonu
async function deleteAccount(accountId, listItemElement) {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Giriş yapmanız gerekiyor.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5104/api/Account/${accountId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      alert("Şifre başarıyla silindi.");
      listItemElement.remove(); // Listeden kaldır
    } else if (response.status === 401) {
      alert("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
      localStorage.removeItem("jwtToken");
      window.location.href = "login.html";
    } else if (response.status === 404) {
      alert("Silinecek şifre bulunamadı.");
    } else {
      const error = await response.text();
      alert(`Şifre silme başarısız: ${error}`);
    }
  } catch (error) {
    console.error("Şifre silme sırasında bir hata oluştu:", error);
    alert("Şifre silme sırasında bir hata oluştu. Lütfen tekrar deneyin.");
  }
}
