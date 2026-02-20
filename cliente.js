const API_URL = "https://gc-10mr.onrender.com";
const grid = document.getElementById('businessGrid');
const appointmentsList = document.getElementById('appointmentsList');
let negociosData = []; // Almacén local para filtrar sin volver a consultar al servidor

// 1. CARGA INICIAL DE DATOS
async function inicializarDashboard() {
    await cargarNegocios();
    await cargarHistorial();
}

// 2. OBTENER NEGOCIOS DESDE RENDER
async function cargarNegocios() {
    try {
        const response = await fetch(`${API_URL}/negocios`);
        negociosData = await response.json();
        renderizarTarjetas(negociosData);
    } catch (error) {
        console.error("Error al cargar negocios:", error);
        grid.innerHTML = "<p>Error al conectar con el servidor.</p>";
    }
}

function renderizarTarjetas(lista) {
    grid.innerHTML = lista.map(n => `
        <div class="card" onclick="verDetalle(${n.id})">
            <img src="${n.logo_url || 'https://via.placeholder.com/150?text=No+Logo'}" 
                 class="business-logo" alt="${n.nombre}">
            <div class="card-info">
                <h3>${n.nombre}</h3>
                <span>${n.categoria}</span>
                <p>📍 Santiago Tuxtla</p>
            </div>
        </div>
    `).join('');
}

// 3. FILTROS
function filtrar(categoria) {
    if (categoria === 'todos') {
        renderizarTarjetas(negociosData);
    } else {
        const filtrados = negociosData.filter(n => n.categoria === categoria);
        renderizarTarjetas(filtrados);
    }
}

// 4. LÓGICA DE CITAS Y EMPALMES (MODAL)
async function verDetalle(id) {
    const n = negociosData.find(item => item.id === id);
    if (!n) return;

    document.getElementById('modalBusinessName').innerText = n.nombre;
    document.getElementById('modalCategory').innerText = n.categoria;
    document.getElementById('modalDays').innerText = n.dias_habiles; // Ej: "L, M, M, J, V"
    document.getElementById('modalHours').innerText = `${n.hora_apertura} - ${n.hora_cierre}`;

    const slotsDiv = document.getElementById('timeSlots');
    slotsDiv.innerHTML = "<p>Selecciona una fecha para ver horarios...</p>";
    
    // Guardar ID del negocio para la cita
    document.getElementById('calendarModal').dataset.bizId = id;
    document.getElementById('calendarModal').style.display = "block";
}

// Cargar huecos libres según fecha (Evita empalmes)
async function loadSlots() {
    const bizId = document.getElementById('calendarModal').dataset.bizId;
    const fecha = document.getElementById('appointmentDate').value;
    const slotsDiv = document.getElementById('timeSlots');

    if (!fecha) return;

    try {
        const response = await fetch(`${API_URL}/disponibilidad/${bizId}?fecha=${fecha}`);
        const slots = await response.json();

        slotsDiv.innerHTML = slots.map(s => `
            <div class="slot ${s.ocupado ? 'ocupado' : 'libre'}" 
                 onclick="${s.ocupado ? '' : `agendarCita('${fecha}', '${s.hora}')`}">
                ${s.hora} ${s.ocupado ? '(Ocupado)' : '(Disponible)'}
            </div>
        `).join('');
    } catch (error) {
        slotsDiv.innerHTML = "<p>Error al cargar horarios.</p>";
    }
}

// 5. AGENDAR Y NOTIFICAR
async function agendarCita(fecha, hora) {
    const bizId = document.getElementById('calendarModal').dataset.bizId;
    const userId = localStorage.getItem('userId');

    if (!confirm(`¿Agendar cita para el ${fecha} a las ${hora}?`)) return;

    try {
        const response = await fetch(`${API_URL}/citas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, bizId, fecha, hora })
        });

        if (response.ok) {
            alert("¡Cita agendada! El negocio ha sido notificado.");
            document.getElementById('calendarModal').style.display = "none";
            cargarHistorial();
        }
    } catch (error) {
        alert("Error al agendar cita.");
    }
}

// 6. HISTORIAL DE CLIENTE (ADMINISTRACIÓN)
async function cargarHistorial() {
    const userId = localStorage.getItem('userId');
    const listDiv = document.getElementById('appointmentsList');

    try {
        const response = await fetch(`${API_URL}/citas-cliente/${userId}`);
        const citas = await response.json();

        listDiv.innerHTML = citas.map(c => `
            <div class="appointment-card">
                <p><strong>${c.nombre_negocio}</strong> - ${c.fecha} a las ${c.hora}</p>
                <p>Estado: <span class="status-${c.estado.toLowerCase()}">${c.estado}</span></p>
                <button onclick="cancelarCita(${c.id})" class="btn-cancel">Cancelar Cita</button>
            </div>
        `).join('') || "<p>No tienes citas agendadas.</p>";
    } catch (error) {
        listDiv.innerHTML = "<p>Error al cargar el historial.</p>";
    }
}

async function cancelarCita(id) {
    if (!confirm("¿Seguro que quieres cancelar esta cita? El negocio recibirá una notificación.")) return;

    try {
        const response = await fetch(`${API_URL}/citas/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert("Cita cancelada.");
            cargarHistorial();
        }
    } catch (error) {
        alert("Error al cancelar.");
    }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', inicializarDashboard);