document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario
    const formulario = document.getElementById('miFormulario');
    const placaInput = document.getElementById('placa');
    const marcaSelect = document.getElementById('marca');
    const modeloInput = document.getElementById('modelo');
    const colorInput = document.getElementById('color');
    const propietarioInput = document.getElementById('propietario');
    const cedulaInput = document.getElementById('cedula');
    const llegadaInput = document.getElementById('llegada');
    const motivoSelect = document.getElementById('motivo');
    const observacionesTextarea = document.getElementById('observaciones');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnConsultar = document.getElementById('btnConsultar');
    const resultadoDiv = document.getElementById('resultado');

    // Configurar fecha y hora actual por defecto
    const ahora = new Date();
    const offset = ahora.getTimezoneOffset();
    const fechaLocal = new Date(ahora.getTime() - (offset * 60 * 1000));
    llegadaInput.value = fechaLocal.toISOString().slice(0, 16);

    // Configurar eventos
    btnGuardar.addEventListener('click', guardarRegistro);
    btnConsultar.addEventListener('click', consultarPlaca);
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
    });

    // Validación en tiempo real
    placaInput.addEventListener('input', function() {
        validarPlaca(this);
    });

    // Función para guardar registro
    async function guardarRegistro() {
        if (!validarFormulario()) {
            mostrarResultado('Por favor complete todos los campos requeridos correctamente', 'error');
            return;
        }

        const datos = {
            placa: placaInput.value.toUpperCase(),
            marca: marcaSelect.value,
            modelo: modeloInput.value,
            color: colorInput.value,
            propietario: propietarioInput.value,
            cedula: cedulaInput.value,
            llegada: llegadaInput.value,
            motivo: motivoSelect.value,
            observaciones: observacionesTextarea.value,
            accion: 'guardar'
        };

        try {
            // Simulación de envío a servidor PHP
            const respuesta = await enviarDatosAlServidor(datos);
            
            if (respuesta.success) {
                mostrarResultado('Registro de entrada guardado exitosamente', 'success');
                formulario.reset();
                // Restablecer la fecha y hora actual
                const nuevaFecha = new Date();
                const nuevoOffset = nuevaFecha.getTimezoneOffset();
                const nuevaFechaLocal = new Date(nuevaFecha.getTime() - (nuevoOffset * 60 * 1000));
                llegadaInput.value = nuevaFechaLocal.toISOString().slice(0, 16);
            } else {
                mostrarResultado(respuesta.message || 'Error al guardar el registro', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarResultado('Error de conexión con el servidor', 'error');
        }
    }

    // Función para consultar placa
    async function consultarPlaca() {
        const placa = placaInput.value.trim().toUpperCase();
        
        if (placa.length === 0) {
            mostrarError(placaInput, 'Ingrese una placa para consultar');
            return;
        }

        if (!/^[A-ZÑ]{3}\d{3}$/.test(placa)) {
            mostrarError(placaInput, 'Formato de placa inválido');
            return;
        }

        try {
            // Simulación de consulta a servidor PHP
            const respuesta = await consultarDatosEnServidor(placa);
            
            if (respuesta.success) {
                mostrarDatosVehiculo(respuesta.data);
            } else {
                mostrarResultado(respuesta.message || 'No se encontró el vehículo', 'warning');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarResultado('Error de conexión con el servidor', 'error');
        }
    }

    // Función para mostrar los datos del vehículo
    function mostrarDatosVehiculo(datos) {
        const fechaLlegada = new Date(datos.llegada);
        const opcionesFecha = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        resultadoDiv.innerHTML = `
            <h2>Información del Vehículo</h2>
            <div class="info-grid">
                <div><strong>Placa:</strong></div>
                <div>${datos.placa}</div>
                
                <div><strong>Marca:</strong></div>
                <div>${datos.marca}</div>
                
                <div><strong>Modelo:</strong></div>
                <div>${datos.modelo}</div>
                
                <div><strong>Color:</strong></div>
                <div>${datos.color}</div>
                
                <div><strong>Propietario:</strong></div>
                <div>${datos.propietario}</div>
                
                <div><strong>Cédula:</strong></div>
                <div>${datos.cedula}</div>
                
                <div><strong>Fecha/Hora Llegada:</strong></div>
                <div>${fechaLlegada.toLocaleDateString('es-ES', opcionesFecha)}</div>
                
                <div><strong>Motivo:</strong></div>
                <div>${datos.motivo}</div>
                
                <div><strong>Observaciones:</strong></div>
                <div>${datos.observaciones || 'Ninguna'}</div>
            </div>
            
            ${datos.salida ? `
                <div class="status-message salida">
                    <strong>Fecha/Hora Salida:</strong> 
                    ${new Date(datos.salida).toLocaleDateString('es-ES', opcionesFecha)}
                </div>
            ` : `
                <div class="status-message entrada">
                    VEHÍCULO ACTUALMENTE EN INSTALACIONES
                </div>
            `}
        `;
        resultadoDiv.style.display = 'block';
    }

    // Función para mostrar resultados
    function mostrarResultado(mensaje, tipo) {
        resultadoDiv.innerHTML = `<p class="${tipo}-message">${mensaje}</p>`;
        resultadoDiv.style.display = 'block';
    }

    // Función para validar todo el formulario
    function validarFormulario() {
        let valido = true;
        
        // Validar placa
        if (!validarPlaca(placaInput)) {
            valido = false;
        }
        
        // Validar marca
        if (marcaSelect.value === '') {
            mostrarError(marcaSelect, 'Seleccione una marca');
            valido = false;
        } else {
            limpiarError(marcaSelect);
        }
        
        // Validar modelo
        if (modeloInput.value.trim() === '') {
            mostrarError(modeloInput, 'Ingrese el modelo');
            valido = false;
        } else {
            limpiarError(modeloInput);
        }
        
        // Validar propietario
        if (propietarioInput.value.trim() === '') {
            mostrarError(propietarioInput, 'Ingrese el nombre del propietario');
            valido = false;
        } else {
            limpiarError(propietarioInput);
        }
        
        // Validar cédula
        if (cedulaInput.value.trim() === '') {
            mostrarError(cedulaInput, 'Ingrese la cédula');
            valido = false;
        } else if (!/^\d+$/.test(cedulaInput.value.trim())) {
            mostrarError(cedulaInput, 'La cédula debe contener solo números');
            valido = false;
        } else {
            limpiarError(cedulaInput);
        }
        
        // Validar llegada
        if (llegadaInput.value.trim() === '') {
            mostrarError(llegadaInput, 'Seleccione fecha y hora de llegada');
            valido = false;
        } else {
            limpiarError(llegadaInput);
        }
        
        return valido;
    }

    // Función para validar placa
    function validarPlaca(input) {
        const placa = input.value.toUpperCase();
        const placaRegex = /^[A-ZÑ]{3}\d{3}$/;
        
        if (placa === '') {
            mostrarError(input, 'La placa es requerida');
            return false;
        }
        
        if (placa.length < 6) {
            mostrarError(input, 'La placa debe tener 6 caracteres (3 letras + 3 números)');
            return false;
        } 
        
        if (!placaRegex.test(placa)) {
            mostrarError(input, 'Formato incorrecto. Ejemplo: ABC123');
            return false;
        }
        
        limpiarError(input);
        input.value = placa;
        return true;
    }

    // Funciones auxiliares para manejo de errores
    function mostrarError(input, mensaje) {
        input.classList.add('input-error');
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = mensaje;
            errorElement.style.display = 'block';
        }
    }

    function limpiarError(input) {
        input.classList.remove('input-error');
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.style.display = 'none';
        }
    }

    // Funciones simuladas para conexión con servidor PHP
    async function enviarDatosAlServidor(datos) {
        // En un caso real, aquí harías una petición fetch a tu backend PHP
        console.log('Enviando a servidor:', datos);
        
        // Simulamos un retraso de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulamos respuesta exitosa del servidor
        return {
            success: true,
            message: 'Datos guardados correctamente',
            data: { 
                id: Math.floor(Math.random() * 1000), 
                ...datos,
                salida: null // Simulamos que aún no ha salido
            }
        };
    }

    async function consultarDatosEnServidor(placa) {
        // En un caso real, aquí harías una petición fetch a tu backend PHP
        console.log('Consultando placa:', placa);
        
        // Simulamos un retraso de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulamos datos de respuesta
        const registros = [
            {
                id: 1,
                placa: 'ABC123',
                marca: 'Toyota',
                modelo: 'Corolla 2023',
                color: 'Rojo',
                propietario: 'Juan Pérez',
                cedula: '123456789',
                llegada: new Date().toISOString(),
                motivo: 'Mantenimiento',
                observaciones: 'Cambio de aceite y revisión general',
                salida: null
            },
            {
                id: 2,
                placa: 'XYZ789',
                marca: 'Nissan',
                modelo: 'Sentra 2022',
                color: 'Azul',
                propietario: 'María Gómez',
                cedula: '987654321',
                llegada: new Date(Date.now() - 86400000).toISOString(), // Ayer
                motivo: 'Entrega',
                observaciones: 'Entrega de paquete',
                salida: new Date().toISOString() // Ya salió
            }
        ];
        
        const registro = registros.find(v => v.placa === placa);
        
        if (registro) {
            return { success: true, data: registro };
        } else {
            return { success: false, message: 'Vehículo no registrado' };
        }
    }
});
