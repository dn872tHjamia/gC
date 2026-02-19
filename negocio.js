// Simulación de citas recibidas
let citasRecibidas = [
    { id: 101, cliente: "Juan Pérez", hora: "10:30", fecha: "2024-05-20", estado: "Confirmada" },
    { id: 102, cliente: "Maria López", hora: "11:00", fecha: "2024-05-20", estado: "Pendiente" }
];

const listContainer = document.getElementById('adminAppointmentsList');

// Función para mostrar citas
function renderCitas() {
    listContainer.innerHTML = citasRecibidas.map(cita => `
        <div class="appointment-card">
            <div class="info">
                <strong>${cita.cliente}</strong> - ${cita.hora} (${cita.fecha})
                <span class="status">${cita.estado}</span>
            </div>
            <div class="actions">
                <button class="btn-delete" onclick="eliminarCita(${cita.id})">Eliminar</button>
                <button class="btn-move" onclick="moverCita(${cita.id})">Mover</button>
            </div>
        </div>
    `).join('');
}

// Función para eliminar cita (Manual)
function eliminarCita(id) {
    if(confirm("¿Estás seguro de eliminar esta cita?")) {
        citasRecibidas = citasRecibidas.filter(c => c.id !== id);
        renderCitas();
        alert("Cita eliminada. El espacio ahora aparecerá VERDE para los clientes.");
    }
}

// Guardar configuración del negocio
document.getElementById('businessConfig').addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Configuración guardada. Los clientes ahora verán tus nuevos horarios.");
});

renderCitas();