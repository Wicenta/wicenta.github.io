// ========================================
// Hamburger Menu Animation
// ========================================
const hamburger = document.getElementsByClassName("hamburger")[0]
const mobileNavs = document.getElementsByClassName("nav-links")[0]

hamburger.addEventListener("click", () => {
  mobileNavs.classList.toggle("active")
})

// ========================================
// Smooth Scroll for Navigation Links
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href.length > 1) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        // Close mobile menu after clicking
        if (mobileNavs.classList.contains('active')) {
          mobileNavs.classList.remove('active');
        }
      }
    }
  });
});

// ========================================
// Parallax Effect for Banner
// ========================================
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const banner = document.querySelector('.banner');

  if (banner && scrolled < window.innerHeight) {
    banner.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
});

// ========================================
// Header Shadow on Scroll
// ========================================
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (window.scrollY > 50) {
    header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
  } else {
    header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
  }
});

// ========================================
// Animate Elements on Scroll (Intersection Observer)
// ========================================
const observerOptions = {
  threshold: 0.2,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe service items, testimonials, etc.
document.querySelectorAll('.service--content .item, .testimonial--content .item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
  observer.observe(el);
});

// Projem Var Popup JS
const REFERANS_KODU = "6134-esra"; // <--- Referans kodunu buradan değiştirebilirsin
const LINK = "https://www.google.com"; // <--- Yönlendirme yapılacak linki buradan değiştirebilirsin

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
          setTimeout(function(){ window.location.href = LINK; }, 2500);
        } else {
          window.location.href = LINK;
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
