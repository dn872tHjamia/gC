const pupils = document.querySelectorAll('.pupil');
const shapes = document.querySelectorAll('.shape');
const passwordField = document.querySelector('#passwordField');
const regPass = document.querySelector('#regPass');

// 1. Seguimiento del Mouse
document.addEventListener('mousemove', (e) => {
    // Si estamos escribiendo en cualquier campo de password, no seguir
    if (document.activeElement.type === 'password') return;

    pupils.forEach(pupil => {
        const rect = pupil.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
        const moveX = Math.cos(angle) * 10;
        const moveY = Math.sin(angle) * 10;
        pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
});

// 2. Girar ojos al escribir contraseña
[passwordField, regPass].forEach(field => {
    field.addEventListener('focus', () => shapes.forEach(s => s.classList.add('shame')));
    field.addEventListener('blur', () => shapes.forEach(s => s.classList.remove('shame')));
});

// 3. Función para cambiar entre formularios
function toggleForms() {
    const loginF = document.getElementById('loginForm');
    const regF = document.getElementById('registerForm');
    
    if (loginF.style.display === "none") {
        loginF.style.display = "flex";
        regF.style.display = "none";
    } else {
        loginF.style.display = "none";
        regF.style.display = "flex";
    }
}

// 4. Evento Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = passwordField.value;

    try {
        const response = await fetch('postgresql://admin:egVeuCRWarlFYiK4vpnicatgIouYTUH4@dpg-d6bhpcpr0fns73e1qr0g-a/citas_db_u5yx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('userId', data.userId);
            window.location.href = data.redirect;
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

// 5. Evento Registro
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = {
        nombre: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPass').value,
        rol: document.getElementById('regRole').value
    };

    try {
         const API_URL = "https://gc-10mr.onrender.com";

         const response = await fetch(`${API_URL}/api/register`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(datos)
    });
        if (res.ok) {
            alert("¡Cuenta creada!");
            toggleForms();
        }
    } catch (err) {
        console.error("Error:", err);
    }
});