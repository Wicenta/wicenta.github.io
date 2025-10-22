const hamburger = document.getElementsByClassName("hamburger")[0]
const mobileNavs = document.getElementsByClassName("nav-links")[0]

hamburger.addEventListener("click", () => {
  mobileNavs.classList.toggle("active")
})

// Projem Var Popup JS
const REFERANS_KODU = "6134-esra"; // <--- Referans kodunu buradan değiştirebilirsin
const INDIRME_LINKI = "https://example.com/indir"; // <--- Yönlendirilecek linki buradan değiştirebilirsin
const DASHBOARD_LINKI = "https://www.google.com"; // <--- Dashboard linkini buradan değiştirebilirsin

const projectBtn = document.getElementById('projectBtn');
const projectModal = document.getElementById('projectModal');
const closeModal = document.getElementById('closeModal');
const refCodeInput = document.getElementById('refCodeInput');
const submitRefCode = document.getElementById('submitRefCode');
const refCodeError = document.getElementById('refCodeError');
const refCodeSuccess = document.getElementById('refCodeSuccess');
const dashboardModal = document.getElementById('dashboardModal');

if(projectBtn && projectModal) {
  projectBtn.onclick = function() {
    projectModal.style.display = 'flex';
    refCodeInput.value = '';
    refCodeError.style.display = 'none';
    refCodeSuccess.style.display = 'none';
    refCodeInput.focus();
    if(dashboardModal) dashboardModal.style.display = 'none';
  };
  closeModal.onclick = function() {
    projectModal.style.display = 'none';
    if(dashboardModal) dashboardModal.style.display = 'none';
  };
  submitRefCode.onclick = function() {
    const val = refCodeInput.value.trim();
    if(val === REFERANS_KODU) {
      refCodeError.style.display = 'none';
      refCodeSuccess.style.display = 'block';
      setTimeout(function(){
        projectModal.style.display = 'none';
        if(dashboardModal) {
          dashboardModal.style.display = 'flex';
          setTimeout(function(){ window.location.assign(DASHBOARD_LINKI); }, 2500);
        }
      }, 900);
    } else {
      refCodeError.style.display = 'block';
      refCodeSuccess.style.display = 'none';
      refCodeInput.style.borderColor = '#c0392b';
      refCodeInput.classList.add('shake');
      setTimeout(function(){ refCodeInput.classList.remove('shake'); refCodeInput.style.borderColor = '#8e44ad'; }, 500);
    }
  };
  // Enter tuşu ile gönder
  refCodeInput.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') submitRefCode.click();
  });
  // Modalı arka plana tıklayınca kapat
  projectModal.onclick = function(e) {
    if(e.target === projectModal) projectModal.style.display = 'none';
    if(dashboardModal) dashboardModal.style.display = 'none';
  };
}

// Shake animasyonu için CSS ekle
const style = document.createElement('style');
style.innerHTML = `.shake { animation: shake 0.3s; } @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-6px); } 50% { transform: translateX(6px); } 75% { transform: translateX(-6px); } 100% { transform: translateX(0); } }`;
document.head.appendChild(style);