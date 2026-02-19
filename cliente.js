// Simulación de datos que vendrían de la base de datos en Render
const negocios = [
    { id: 1, nombre: "Barbería El Tuxtleco", cat: "Barbería", img: "https://via.placeholder.com/150", slots: [
        { hora: "10:00", ocupado: false },
        { hora: "10:30", ocupado: true },
        { hora: "11:00", ocupado: false }
    ]},
    { id: 2, nombre: "Dental San Juan", cat: "Dentista", img: "https://via.placeholder.com/150", slots: [
        { hora: "09:00", ocupado: true },
        { hora: "10:00", ocupado: false }
    ]}
];

const grid = document.getElementById('businessGrid');

// Dibujar tarjetas
function cargarNegocios() {
    grid.innerHTML = negocios.map(n => `
        <div class="card" onclick="verDetalle(${n.id})">
            <img src="${n.img}">
            <div class="card-info">
                <h3>${n.nombre}</h3>
                <span>${n.cat}</span>
            </div>
        </div>
    `).join('');
}

// Lógica del Calendario Verde/Rojo
function verDetalle(id) {
    const n = negocios.find(item => item.id === id);
    document.getElementById('modalBusinessName').innerText = n.nombre;
    const slotsDiv = document.getElementById('timeSlots');
    
    slotsDiv.innerHTML = n.slots.map(s => `
        <div class="slot ${s.ocupado ? 'ocupado' : 'libre'}">
            ${s.hora} ${s.ocupado ? '(Ocupado)' : '(Libre)'}
        </div>
    `).join('');

    document.getElementById('calendarModal').style.display = "block";
}

// Cerrar Modal
document.querySelector('.close').onclick = () => {
    document.getElementById('calendarModal').style.display = "none";
}

cargarNegocios();