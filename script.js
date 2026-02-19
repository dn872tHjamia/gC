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
// ... (Tus funciones de seguimiento de ojos y toggleForms se quedan igual)

// 4. Evento Login CORREGIDO
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = passwordField.value;

    try {
        // CAMBIO: Ahora apunta a tu servidor de Render, no a la DB directamente
        const response = await fetch('https://gc-10mr.onrender.com/login', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (response.ok) { // Cambiado de data.success a response.ok para mayor seguridad
            localStorage.setItem('userId', data.userId);
            window.location.href = "dashboard.html"; // Asegúrate de que este archivo exista
        } else {
            alert(data.error || "Error al iniciar sesión");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el servidor");
    }
});

// 5. Evento Registro CORREGIDO
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

        // IMPORTANTE: Quité el "/api" porque tu servidor dio error 404 antes
        const response = await fetch(`${API_URL}/register`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        // CORRECCIÓN: Usar 'response' en lugar de 'res'
        if (response.ok) { 
            alert("¡Cuenta creada con éxito!");
            toggleForms();
        } else {
            const errorData = await response.json();
            alert("Error: " + errorData.message);
        }
    } catch (err) {
        console.error("Error:", err);
        alert("Error de conexión");
    }
});