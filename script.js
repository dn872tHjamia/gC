// 1. CONFIGURACIÓN Y SELECTORES
const API_URL = "https://gc-10mr.onrender.com";
const pupils = document.querySelectorAll('.pupil');
const shapes = document.querySelectorAll('.shape');
const passwordField = document.querySelector('#passwordField');
const regPass = document.querySelector('#regPass');

// 2. LÓGICA VISUAL (Seguimiento del Mouse)
document.addEventListener('mousemove', (e) => {
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

[passwordField, regPass].forEach(field => {
    field.addEventListener('focus', () => shapes.forEach(s => s.classList.add('shame')));
    field.addEventListener('blur', () => shapes.forEach(s => s.classList.remove('shame')));
});

function toggleForms() {
    const loginF = document.getElementById('loginForm');
    const regF = document.getElementById('registerForm');
    const isLoginVisible = loginF.style.display !== "none";
    loginF.style.display = isLoginVisible ? "none" : "flex";
    regF.style.display = isLoginVisible ? "flex" : "none";
}

// 3. VALIDACIÓN DE CONTRASEÑA (9+ caracteres, Mayúscula, Número, Símbolo)
function validarPassword(pass) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{9,}$/;
    return regex.test(pass);
}

// 4. EVENTO LOGIN
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = passwordField.value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userRole', data.rol);
            // Redirección según rol registrado en DB
            window.location.href = data.rol === 'negocio' ? "dashboard-negocio.html" : "dashboard-cliente.html";
        } else {
            alert(data.error || "Credenciales incorrectas");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("Error de conexión con el servidor de Render");
    }
});

// 5. EVENTO REGISTRO (Incluye campo de teléfono)
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const passValue = regPass.value;

    if (!validarPassword(passValue)) {
        alert("La contraseña debe tener: Al menos 9 caracteres, una mayúscula, un número y un carácter especial.");
        return;
    }

    const datos = {
        nombre: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        telefono: document.getElementById('regPhone').value, // Nuevo campo
        password: passValue,
        rol: document.getElementById('regRole').value
    };

    try {
        const response = await fetch(`${API_URL}/register`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const data = await response.json();
        if (response.ok) {
            alert("¡Cuenta creada con éxito! Ya puedes iniciar sesión.");
            toggleForms();
        } else {
            alert(data.error || "Error al registrar usuario");
        }
    } catch (err) {
        console.error("Error de red:", err);
        alert("No se pudo conectar con el servidor de Render");
    }
});