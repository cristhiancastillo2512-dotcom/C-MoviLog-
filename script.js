document.addEventListener('DOMContentLoaded', function() {
    // Función segura para obtener elementos
    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Elemento con ID '${id}' no encontrado`);
            return null;
        }
        return element;
    }

    // Obtener elementos de forma segura
    const formulario = getElement('miFormulario');
    const placaInput = getElement('placa');
    const marcaSelect = getElement('marca');
    const modeloInput = getElement('modelo');
    const propietarioInput = getElement('propietario');
    const cedulaInput = getElement('cedula');
    const llegadaInput = getElement('llegada');
    const btnGuardar = getElement('btnGuardar');
    const btnConsultar = getElement('btnConsultar');
    const resultadoDiv = getElement('resultado');

    // Verificar elementos esenciales
    if (!formulario || !placaInput || !btnGuardar || !btnConsultar) {
        console.error('Elementos esenciales del formulario no encontrados');
        return;
    }

    // Configurar eventos solo si los elementos existen
    if (btnGuardar) btnGuardar.addEventListener('click', guardarRegistro);
    if (btnConsultar) btnConsultar.addEventListener('click', consultarPlaca);
    if (formulario) formulario.addEventListener('submit', function(e) {
        e.preventDefault();
    });

    // Configurar fecha y hora actual por defecto
    function setCurrentDateTime() {
        if (!llegadaInput) return;
        const ahora = new Date();
        const offset = ahora.getTimezoneOffset();
        const fechaLocal = new Date(ahora.getTime() - (offset * 60 * 1000));
        llegadaInput.value = fechaLocal.toISOString().slice(0, 16);
    }
    setCurrentDateTime();

    // Validación en tiempo real
    if (placaInput) {
        placaInput.addEventListener('input', function() {
            validarPlaca(this);
        });
    }

    // Función para guardar registro
    async function guardarRegistro() {
        if (!validarFormulario()) {
            mostrarResultado('Por favor complete todos los campos requeridos correctamente', 'error');
            return;
        }

        const datos = {
            placa: placaInput.value.toUpperCase(),
            marca: marcaSelect ? marcaSelect.value : '',
            modelo: modeloInput ? modeloInput.value : '',
            propietario: propietarioInput ? propietarioInput.value : '',
            cedula: cedulaInput ? cedulaInput.value : '',
            llegada: llegadaInput ? llegadaInput.value : '',
            accion: 'guardar'
        };

        try {
            const respuesta = await enviarDatosAlServidor(datos);
            
            if (respuesta.success) {
                mostrarResultado('Registro guardado exitosamente', 'success');
                if (formulario) formulario.reset();
                setCurrentDateTime();
            } else {
                mostrarResultado(respuesta.message || 'Error al guardar', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarResultado('Error de conexión', 'error');
        }
    }

    // Función para consultar placa
    async function consultarPlaca() {
        const placa = placaInput.value.trim().toUpperCase();
        
        if (placa.length === 0) {
            mostrarError(placaInput, 'Ingrese una placa');
            return;
        }

        if (!/^[A-ZÑ]{3}\d{3}$/.test(placa)) {
            mostrarError(placaInput, 'Formato inválido');
            return;
        }

        try {
            const respuesta = await consultarDatosEnServidor(placa);
            
            if (respuesta.success) {
                mostrarDatosVehiculo(respuesta.data);
            } else {
                mostrarResultado(respuesta.message || 'No encontrado', 'warning');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarResultado('Error de conexión', 'error');
        }
    }

    // Función para mostrar datos
    function mostrarDatosVehiculo(datos) {
        if (!resultadoDiv) return;
        
        resultadoDiv.innerHTML = `
            <h2>Información del Vehículo</h2>
            <div class="info-grid">
                <div><strong>Placa:</strong></div>
                <div>${datos.placa}</div>
                <div><strong>Marca:</strong></div>
                <div>${datos.marca}</div>
                <div><strong>Modelo:</strong></div>
                <div>${datos.modelo}</div>
                <div><strong>Propietario:</strong></div>
                <div>${datos.propietario}</div>
                <div><strong>Cédula:</strong></div>
                <div>${datos.cedula}</div>
            </div>
        `;
        resultadoDiv.style.display = 'block';
    }

    // Función para mostrar resultados
    function mostrarResultado(mensaje, tipo) {
        if (!resultadoDiv) return;
        resultadoDiv.innerHTML = `<p class="${tipo}-message">${mensaje}</p>`;
        resultadoDiv.style.display = 'block';
    }

    // Función para validar formulario
    function validarFormulario() {
        let valido = true;
        
        if (!validarPlaca(placaInput)) valido = false;
        if (marcaSelect && marcaSelect.value === '') {
            mostrarError(marcaSelect, 'Seleccione marca');
            valido = false;
        }
        if (modeloInput && modeloInput.value.trim() === '') {
            mostrarError(modeloInput, 'Ingrese modelo');
            valido = false;
        }
        if (propietarioInput && propietarioInput.value.trim() === '') {
            mostrarError(propietarioInput, 'Ingrese propietario');
            valido = false;
        }
        if (cedulaInput && (cedulaInput.value.trim() === '' || !/^\d+$/.test(cedulaInput.value.trim()))) {
            mostrarError(cedulaInput, 'Cédula inválida');
            valido = false;
        }
        
        return valido;
    }

    // Función para validar placa
    function validarPlaca(input) {
        if (!input) return false;
        
        const placa = input.value.toUpperCase();
        const placaRegex = /^[A-ZÑ]{3}\d{3}$/;
        
        if (placa === '') {
            mostrarError(input, 'Placa requerida');
            return false;
        }
        
        if (!placaRegex.test(placa)) {
            mostrarError(input, 'Formato: ABC123');
            return false;
        }
        
        limpiarError(input);
        input.value = placa;
        return true;
    }

    // Funciones para manejo de errores
    function mostrarError(input, mensaje) {
        if (!input) return;
        input.classList.add('input-error');
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = mensaje;
            errorElement.style.display = 'block';
        }
    }

    function limpiarError(input) {
        if (!input) return;
        input.classList.remove('input-error');
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.style.display = 'none';
        }
    }

    // Funciones simuladas para conexión con servidor
    async function enviarDatosAlServidor(datos) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            message: 'Datos guardados',
            data: datos
        };
    }

    async function consultarDatosEnServidor(placa) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const vehiculos = [{
            placa: placa,
            marca: 'Marca Ejemplo',
            modelo: 'Modelo Ejemplo',
            propietario: 'Propietario Ejemplo',
            cedula: '123456789'
        }];
        const vehiculo = vehiculos.find(v => v.placa === placa);
        return vehiculo ? 
            { success: true, data: vehiculo } : 
            { success: false, message: 'No encontrado' };
    }
});
