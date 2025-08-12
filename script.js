document.addEventListener('DOMContentLoaded', function() {
    // Verificación segura de elementos del DOM
    const placaInput = document.getElementById('placa');
    const errorPlaca = document.getElementById('error-placa');
    const formulario = document.getElementById('miFormulario');

    // Verificar que los elementos existan antes de continuar
    if (!placaInput || !formulario) {
        console.error('Error: Elementos esenciales del formulario no encontrados');
        return;
    }

    // Validación en tiempo real de la placa
    placaInput.addEventListener('input', function() {
        validarPlaca(this);
    });

    // Validación al enviar el formulario
    formulario.addEventListener('submit', function(event) {
        if (!validarFormulario()) {
            event.preventDefault();
            
            // Mostrar mensaje de error general si hay campos inválidos
            if (errorPlaca) {
                errorPlaca.textContent = 'Por favor complete correctamente todos los campos';
                errorPlaca.style.display = 'block';
            }
        }
    });

    function validarPlaca(input) {
        const placa = input.value.toUpperCase();
        
        // Expresión regular mejorada para placas (3 letras + 3 números)
        const placaRegex = /^[A-ZÑ]{3}\d{3}$/;
        
        // Limpiar errores si está vacío
        if (placa === '') {
            limpiarError(input);
            return false; // Cambiado a false para requerir el campo
        }
        
        // Validar longitud
        if (placa.length < 6) {
            mostrarError(input, 'La placa debe tener 6 caracteres (3 letras + 3 números)');
            return false;
        } 
        
        // Validar formato
        if (!placaRegex.test(placa)) {
            mostrarError(input, 'Formato incorrecto. Use 3 letras seguidas de 3 números (Ej: ABC123)');
            return false;
        }
        
        // Si es válido
        limpiarError(input);
        input.value = placa; // Forzar mayúsculas
        return true;
    }

    function mostrarError(input, mensaje) {
        input.classList.add('input-error');
        if (errorPlaca) {
            errorPlaca.textContent = mensaje;
            errorPlaca.style.display = 'block';
        }
    }

    function limpiarError(input) {
        input.classList.remove('input-error');
        if (errorPlaca) {
            errorPlaca.style.display = 'none';
        }
    }

    function validarFormulario() {
        let valido = true;
        
        // Validar placa
        if (!validarPlaca(placaInput)) {
            valido = false;
            if (!placaInput.classList.contains('input-error')) {
                mostrarError(placaInput, 'La placa es requerida');
            }
            placaInput.focus();
        }
        
        // Aquí puedes añadir validaciones para otros campos
        // Ejemplo:
        /*
        const nombreInput = document.getElementById('nombre');
        if (!nombreInput.value.trim()) {
            mostrarError(nombreInput, 'El nombre es requerido');
            valido = false;
        }
        */
        
        return valido;
    }
});
