// Configuración
const CONFIG = {
    ADMIN_KEY: "0112",
    STORAGE_KEY: "registros_AGV"
};

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const elements = {
        nombre: document.getElementById('nombre'),
        cedula: document.getElementById('cedula'),
        destino: document.getElementById('destino'),
        fecha: document.getElementById('fecha'),
        hora: document.getElementById('hora'),
        claveAdmin: document.getElementById('claveAdmin'),
        btnGuardar: document.getElementById('btnGuardar'),
        btnMostrar: document.getElementById('btnMostrar'),
        btnBorrar: document.getElementById('btnBorrar'),
        btnExportar: document.getElementById('btnExportar'),
        datosGuardados: document.getElementById('datosGuardados')
    };

    // Verificar que todos los elementos existen
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Elemento no encontrado: ${key}`);
            return;
        }
    }

    // Inicialización
    init();

    function init() {
        setFechaHora();
        setupEventListeners();
    }

    function setFechaHora() {
        const hoy = new Date();
        elements.fecha.value = hoy.toISOString().split('T')[0];
        elements.hora.value = hoy.toTimeString().slice(0, 5);
    }

    function setupEventListeners() {
        elements.btnGuardar.addEventListener('click', guardarDatos);
        elements.btnMostrar.addEventListener('click', mostrarDatos);
        elements.btnBorrar.addEventListener('click', borrarDatos);
        elements.btnExportar.addEventListener('click', exportarExcel);
    }

    function obtenerRegistros() {
        const datos = localStorage.getItem(CONFIG.STORAGE_KEY);
        return datos ? JSON.parse(datos) : [];
    }

    function guardarDatos() {
        const registro = {
            nombre: elements.nombre.value.trim(),
            cedula: elements.cedula.value.trim(),
            destino: elements.destino.value.trim(),
            fecha: elements.fecha.value,
            hora: elements.hora.value
        };

        if (!registro.nombre || !registro.cedula || !registro.destino) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        const registros = obtenerRegistros();
        registros.push(registro);
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(registros));

        alert("Datos guardados correctamente");
        limpiarFormulario();
        setFechaHora();
    }

    function mostrarDatos() {
        if (!validarAdmin()) return;

        const registros = obtenerRegistros();
        elements.datosGuardados.innerHTML = "<h2>Datos guardados:</h2>";

        if (registros.length === 0) {
            elements.datosGuardados.innerHTML += "<p>No hay registros almacenados.</p>";
            return;
        }

        registros.forEach((r, i) => {
            elements.datosGuardados.innerHTML += `
                <p>${i+1}. ${r.nombre} (Cédula: ${r.cedula}) - ${r.destino} - ${r.fecha} - ${r.hora}</p>
            `;
        });
    }

    function borrarDatos() {
        if (!validarAdmin()) return;

        if (confirm("¿Está seguro que desea borrar todos los datos? Esta acción no se puede deshacer.")) {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            elements.datosGuardados.innerHTML = "";
            alert("Datos borrados correctamente");
        }
    }

    function exportarExcel() {
        if (!validarAdmin()) return;

        const registros = obtenerRegistros();
        if (registros.length === 0) {
            alert("No hay datos para exportar");
            return;
        }

        const hoja = XLSX.utils.json_to_sheet(registros);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Registros_AGV");
        XLSX.writeFile(libro, "registros_AGV.xlsx");
    }

    // Funciones auxiliares
    function validarAdmin() {
        if (elements.claveAdmin.value !== CONFIG.ADMIN_KEY) {
            alert("Clave incorrecta");
            return false;
        }
        return true;
    }

    function limpiarFormulario() {
        elements.nombre.value = "";
        elements.cedula.value = "";
        elements.destino.value = "";
    }
});