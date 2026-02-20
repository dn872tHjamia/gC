const API_URL = "https://gc-10mr.onrender.com";
const listContainer = document.getElementById('adminAppointmentsList');
const bizId = localStorage.getItem('userId'); // El ID del dueño es el ID del negocio

// 1. CARGA INICIAL: DATOS DEL NEGOCIO Y CITAS
async function inicializarAdmin() {
    if (!bizId) {
        window.location.href = "index.html";
        return;
    }
    await cargarDatosNegocio();
    await cargarCitasAdmin();
}

// 2. OBTENER CONFIGURACIÓN ACTUAL (Para el formulario)
async function cargarDatosNegocio() {
    try {
        const response = await fetch(`${API_URL}/negocio-config/${bizId}`);
        if (response.ok) {
            const data = await response.json();
            document.getElementById('bizName').value = data.nombre || "";
            document.getElementById('bizPhone').value = data.telefono || "";
            document.getElementById('bizCategory').value = data.categoria || "Barbería";
            document.getElementById('openTime').value = data.hora_apertura || "09:00";
            document.getElementById('closeTime').value = data.hora_cierre || "18:00";
            document.getElementById('interval').value = data.duracion_servicio || "30";
            document.getElementById('fbLink').value = data.facebook || "";
            document.getElementById('igLink').value = data.instagram || "";
            if (data.logo_url) document.getElementById('logoPreview').src = data.logo_url;
        }
    } catch (err) {
        console.error("Error al cargar configuración:", err);
    }
}

// 3. GUARDAR CONFIGURACIÓN (Incluye validación de Logo .webp < 2MB)
document.getElementById('businessConfig').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const logoFile = document.getElementById('bizLogo').files[0];
    const formData = new FormData();
    
    formData.append('nombre', document.getElementById('bizName').value);
    formData.append('telefono', document.getElementById('bizPhone').value);
    formData.append('categoria', document.getElementById('bizCategory').value);
    formData.append('hora_apertura', document.getElementById('openTime').value);
    formData.append('hora_cierre', document.getElementById('closeTime').value);
    formData.append('duracion_servicio', document.getElementById('interval').value);
    formData.append('facebook', document.getElementById('fbLink').value);
    formData.append('instagram', document.getElementById('igLink').value);
    
    // Obtener días seleccionados
    const dias = Array.from(document.querySelectorAll('input[name="days"]:checked')).map(cb => cb.value);
    formData.append('dias_habiles', dias.join(','));

    if (logoFile) {
        formData.append('logo', logoFile);
    }

    try {
        const response = await fetch(`${API_URL}/negocio-config/${bizId}`, {
            method: 'PUT',
            body: formData // Usamos FormData para el archivo .webp
        });

        if (response.ok) {
            alert("Configuración actualizada correctamente.");
            cargarDatosNegocio();
        }
    } catch (err) {
        alert("Error al guardar la configuración.");
    }
});

// 4. GESTIÓN DEL HISTORIAL DE CITAS (NOTIFICACIONES)
async function cargarCitasAdmin() {
    try {
        const response = await fetch(`${API_URL}/citas-negocio/${bizId}`);
        const citas = await response.json();

        listContainer.innerHTML = citas.map(cita => `
            <div class="appointment-card">
                <div class="info">
                    <strong>${cita.nombre_cliente}</strong> - ${cita.hora} (${cita.fecha})
                    <p>Tel: ${cita.telefono_cliente}</p>
                    <span class="status status-${cita.estado.toLowerCase()}">${cita.estado}</span>
                </div>
                <div class="actions">
                    <button class="btn-delete" onclick="eliminarCita(${cita.id})">Eliminar</button>
                    <button class="btn-move" onclick="moverCita(${cita.id})">Cambiar Hora</button>
                </div>
            </div>
        `).join('') || "<p>No hay citas registradas.</p>";
    } catch (err) {
        listContainer.innerHTML = "<p>Error al cargar el historial de citas.</p>";
    }
}

// 5. ELIMINAR CITA Y LIBERAR HORARIO (Notifica al usuario)
async function eliminarCita(id) {
    if (!confirm("¿Eliminar cita? El cliente será notificado automáticamente.")) return;

    try {
        const response = await fetch(`${API_URL}/citas/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert("Cita eliminada. El horario ahora está disponible.");
            cargarCitasAdmin();
        }
    } catch (err) {
        alert("Error al eliminar la cita.");
    }
}

// 6. MOVER CITA (Lógica de administración)
async function moverCita(id) {
    const nuevaHora = prompt("Ingresa la nueva hora (HH:MM):");
    if (!nuevaHora) return;

    try {
        const response = await fetch(`${API_URL}/citas/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hora: nuevaHora })
        });
        if (response.ok) {
            alert("Cita reprogramada. Se notificó al cliente.");
            cargarCitasAdmin();
        }
    } catch (err) {
        alert("Error al reprogramar.");
    }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', inicializarAdmin);