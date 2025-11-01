// Modern ES6+ JavaScript
const hamburger = document.getElementsByClassName("hamburger")[0];
const mobileNavs = document.getElementsByClassName("nav-links")[0];
const siteHeader = document.querySelector(".site-header");

// Hamburger menu toggle
if (hamburger && mobileNavs) {
  hamburger.addEventListener("click", () => {
    mobileNavs.classList.toggle("active");
    hamburger.classList.toggle("active");
    document.body.style.overflow = mobileNavs.classList.contains("active") ? "hidden" : "";
  });
}

// Header scroll effect
let lastScroll = 0;
const handleScroll = () => {
  const currentScroll = window.pageYOffset;
  
  if (siteHeader) {
    if (currentScroll > 100) {
      siteHeader.classList.add("scrolled");
    } else {
      siteHeader.classList.remove("scrolled");
    }
  }
  
  lastScroll = currentScroll;
};

window.addEventListener("scroll", handleScroll, { passive: true });

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      // Close mobile menu if open
      if (mobileNavs && mobileNavs.classList.contains("active")) {
        mobileNavs.classList.remove("active");
        hamburger.classList.remove("active");
        document.body.style.overflow = "";
      }
    }
  });
});

// Projem Var Popup JS
const REFERANS_KODU = "6134-esra";
const LINK = "https://www.google.com";

const projectBtn = document.getElementById('projectBtn');
const projectModal = document.getElementById('projectModal');
const closeModal = document.getElementById('closeModal');
const refCodeInput = document.getElementById('refCodeInput');
const submitRefCode = document.getElementById('submitRefCode');
const refCodeError = document.getElementById('refCodeError');
const refCodeSuccess = document.getElementById('refCodeSuccess');
const dashboardModal = document.getElementById('dashboardModal');

if (projectBtn && projectModal) {
  projectBtn.onclick = function() {
    projectModal.style.display = 'flex';
    refCodeInput.value = '';
    refCodeError.style.display = 'none';
    refCodeSuccess.style.display = 'none';
    refCodeInput.focus();
    if (dashboardModal) dashboardModal.style.display = 'none';
    document.body.style.overflow = 'hidden';
  };

  if (closeModal) {
    closeModal.onclick = function() {
      projectModal.style.display = 'none';
      if (dashboardModal) dashboardModal.style.display = 'none';
      document.body.style.overflow = '';
    };
  }

  if (submitRefCode) {
    submitRefCode.onclick = function() {
      const val = refCodeInput.value.trim();
      if (val === REFERANS_KODU) {
        refCodeError.style.display = 'none';
        refCodeSuccess.style.display = 'block';
        setTimeout(function() {
          projectModal.style.display = 'none';
          if (dashboardModal) {
            dashboardModal.style.display = 'flex';
            setTimeout(function() { 
              window.location.href = LINK; 
            }, 2500);
          } else {
            window.location.href = LINK;
          }
        }, 900);
      } else {
        refCodeError.style.display = 'block';
        refCodeSuccess.style.display = 'none';
        refCodeInput.style.borderColor = '#c0392b';
        refCodeInput.classList.add('shake');
        setTimeout(function() { 
          refCodeInput.classList.remove('shake'); 
          refCodeInput.style.borderColor = '#8e44ad'; 
        }, 500);
      }
    };
  }

  // Enter tuşu ile gönder
  if (refCodeInput) {
    refCodeInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && submitRefCode) {
        submitRefCode.click();
      }
    });
  }

  // Modalı arka plana tıklayınca kapat
  projectModal.onclick = function(e) {
    if (e.target === projectModal) {
      projectModal.style.display = 'none';
      if (dashboardModal) dashboardModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };
}

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe portfolio items
document.querySelectorAll('#portfolio .item').forEach(item => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(30px)';
  item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(item);
});

// Shake animasyonu için CSS ekle
const style = document.createElement('style');
style.innerHTML = `
  .shake { 
    animation: shake 0.3s; 
  } 
  
  @keyframes shake { 
    0% { transform: translateX(0); } 
    25% { transform: translateX(-6px); } 
    50% { transform: translateX(6px); } 
    75% { transform: translateX(-6px); } 
    100% { transform: translateX(0); } 
  }
`;
document.head.appendChild(style);
