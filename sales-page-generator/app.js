// --- CONFIGURATION & STATE ---
const STATE = {
    user: JSON.parse(localStorage.getItem('salesgenius_user')) || null,
    generatedHTML: ""
};

// --- AUTH LOGIC ---
const updateAuthUI = () => {
    const user = STATE.user;
    if (user) {
        const nameEl = document.getElementById('userName');
        const emailEl = document.getElementById('userEmail');
        const initialEl = document.getElementById('userInitial');

        if (nameEl) nameEl.textContent = `${user.firstName} ${user.lastName}`;
        if (emailEl) emailEl.textContent = user.email;
        if (initialEl) initialEl.textContent = user.firstName[0].toUpperCase();
    }
};

const checkAuth = () => {
    const isDashboard = window.location.pathname.includes('dashboard.html');
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html');

    if (isDashboard && !STATE.user) {
        window.location.href = 'login.html';
    }
    if (isAuthPage && STATE.user) {
        window.location.href = 'dashboard.html';
    }
};

// --- FORM HANDLING ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateAuthUI();

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.getElementById('registerBtn');
            const error = document.getElementById('formError');
            const success = document.getElementById('formSuccess');

            const userData = {
                firstName: e.target.firstName.value,
                lastName: e.target.lastName.value,
                email: e.target.email.value,
                password: e.target.password.value
            };

            // Basic validation
            if (e.target.password.value !== e.target.confirmPassword.value) {
                showError("Les mots de passe ne correspondent pas.");
                return;
            }

            // Simulate loading
            setLoading(btn, true);
            setTimeout(() => {
                localStorage.setItem('salesgenius_user', JSON.stringify(userData));
                STATE.user = userData;
                success.style.display = 'flex';
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
            }, 1000);
        });
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            const btn = document.getElementById('loginBtn');

            setLoading(btn, true);

            setTimeout(() => {
                const storedUser = JSON.parse(localStorage.getItem('salesgenius_user'));
                if (storedUser && storedUser.email === email && storedUser.password === password) {
                    STATE.user = storedUser;
                    document.getElementById('formSuccess').style.display = 'flex';
                    setTimeout(() => window.location.href = 'dashboard.html', 1000);
                } else {
                    setLoading(btn, false);
                    showError("Email ou mot de passe incorrect.");
                }
            }, 1000);
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('salesgenius_user');
            window.location.href = 'index.html';
        });
    }

    // Password Toggle
    const togglePass = document.getElementById('togglePassword');
    if (togglePass) {
        togglePass.addEventListener('click', () => {
            const passInput = document.getElementById('password');
            const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passInput.setAttribute('type', type);
        });
    }

    // --- GENERATOR LOGIC ---
    const generatorForm = document.getElementById('generatorForm');
    if (generatorForm) {
        generatorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('productName').value,
                price: document.getElementById('productPrice').value,
                category: document.getElementById('productCategory').value,
                description: document.getElementById('productDescription').value,
                benefits: document.getElementById('productBenefits').value.split('\n'),
                target: document.getElementById('targetAudience').value
            };

            showGeneratingState(true);

            // Progress animation simulation
            await simulateProgress();

            // Generate the HTML
            const html = generateSalesPageHTML(formData);
            STATE.generatedHTML = html;

            showGeneratingState(false);
            showResult(html);
        });
    }
});

// --- HELPER FUNCTIONS ---
const showError = (msg) => {
    const errEl = document.getElementById('formError');
    const msgEl = document.getElementById('errorMessage');
    if (errEl && msgEl) {
        msgEl.textContent = msg;
        errEl.style.display = 'flex';
    }
};

const setLoading = (btn, isLoading) => {
    const text = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');
    if (isLoading) {
        btn.disabled = true;
        text.style.display = 'none';
        loader.style.display = 'inline-block';
    } else {
        btn.disabled = false;
        text.style.display = 'inline-block';
        loader.style.display = 'none';
    }
};

const showGeneratingState = (show) => {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
};

const simulateProgress = () => {
    return new Promise((resolve) => {
        const bar = document.getElementById('progressBar');
        const steps = document.querySelectorAll('.status-step');
        let progress = 0;

        const interval = setInterval(() => {
            progress += 1;
            if (bar) bar.style.width = `${progress}%`;

            // Change status text
            if (progress === 25) activateStep(1);
            if (progress === 50) activateStep(2);
            if (progress === 75) activateStep(3);

            if (progress >= 100) {
                clearInterval(interval);
                resolve();
            }
        }, 30);
    });
};

const activateStep = (index) => {
    const steps = document.querySelectorAll('.status-step');
    steps.forEach((s, i) => {
        if (i === index) s.classList.add('active');
        else s.classList.remove('active');
    });
};

const showResult = (html) => {
    const modal = document.getElementById('resultModal');
    const iframe = document.getElementById('previewIframe');
    modal.style.display = 'flex';

    // Inject generated content into iframe
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
};

const closeModal = () => {
    document.getElementById('resultModal').style.display = 'none';
};

// --- AI COPYWRITING ENGINE (Simulation) ---
const generateSalesPageHTML = (data) => {
    const benefitsHTML = data.benefits.map(b => `
        <div class="benefit-card">
            <div class="check">✓</div>
            <p>${b}</p>
        </div>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name} - Offre Spéciale</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root { --p: #6366f1; --s: #f43f5e; }
        body { font-family: 'Outfit', sans-serif; margin: 0; color: #1e293b; background: #f8fafc; overflow-x: hidden; }
        .container { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem; }
        header { background: white; padding: 1.5rem 0; border-bottom: 1px solid #e2e8f0; }
        .badge { background: #e0e7ff; color: #4338ca; padding: 0.5rem 1rem; border-radius: 100px; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 1.5rem; display: inline-block; }
        .hero { padding: 6rem 0; text-align: center; background: radial-gradient(circle at top right, #fdf2f8, #f5f3ff); }
        h1 { font-size: 3.5rem; line-height: 1.1; margin-bottom: 1.5rem; color: #0f172a; }
        .desc { font-size: 1.25rem; color: #64748b; max-width: 700px; margin: 0 auto 2.5rem; }
        .btn { background: linear-gradient(135deg, var(--p), var(--s)); color: white; padding: 1.25rem 2.5rem; border-radius: 12px; font-weight: 800; font-size: 1.2rem; text-decoration: none; display: inline-block; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4); transition: transform 0.2s; }
        .btn:hover { transform: scale(1.05); }
        .benefits { padding: 5rem 0; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); display: grid; gap: 2rem; }
        .benefit-card { background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 1rem; }
        .check { background: #dcfce7; color: #15803d; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; }
        .pricing { background: #0f172a; color: white; padding: 5rem 0; text-align: center; border-radius: 40px 40px 0 0; }
        .price-box { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 3rem; border-radius: 24px; max-width: 400px; margin: 2rem auto; }
        .price { font-size: 4rem; font-weight: 800; margin-bottom: 1rem; }
        footer { padding: 3rem; text-align: center; color: #94a3b8; font-size: 0.9rem; }
    </style>
</head>
<body>
    <header>
        <div class="container" style="font-weight: 800; font-size: 1.5rem;">${data.name}</div>
    </header>
    <section class="hero">
        <div class="container">
            <span class="badge">Attention ${data.target}</span>
            <h1>Découvrez comment ${data.name} va transformer votre quotidien</h1>
            <p class="desc">${data.description}</p>
            <a href="#offer" class="btn">Profiter de l'offre maintenant</a>
        </div>
    </section>
    <section class="container">
        <div class="benefits">
            ${benefitsHTML}
        </div>
    </section>
    <section class="pricing" id="offer">
        <div class="container">
            <h2>Prêt à passer au niveau supérieur ?</h2>
            <div class="price-box">
                <p>Investissement Unique</p>
                <div class="price">${data.price}</div>
                <ul style="list-style: none; padding: 0; margin-bottom: 2rem; color: #94a3b8; text-align: left;">
                    <li style="margin-bottom: 0.5rem;">✓ Accès à Vie</li>
                    <li style="margin-bottom: 0.5rem;">✓ Support Premium 24/7</li>
                    <li style="margin-bottom: 0.5rem;">✓ Mises à jour incluses</li>
                </ul>
                <a href="#" class="btn" style="width: 100%; box-sizing: border-box;">Obtenir ${data.name}</a>
            </div>
            <p style="margin-top: 1rem; opacity: 0.6;">Garantie satisfait ou remboursé de 30 jours</p>
        </div>
    </section>
    <footer>
        &copy; 2026 ${data.name}. Tous droits réservés.
    </footer>
</body>
</html>
    `;
};

// Copy and Download Handlers
document.getElementById('copyCodeBtn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(STATE.generatedHTML);
    alert("Code HTML copié !");
});

document.getElementById('downloadBtn')?.addEventListener('click', () => {
    const blob = new Blob([STATE.generatedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page-de-vente.html';
    a.click();
    URL.revokeObjectURL(url);
});
