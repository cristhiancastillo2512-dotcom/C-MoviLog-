function validarPlaca(input) {
    const placa = input.value.toUpperCase();
    const errorElement = document.getElementById("error-placa");
    
    // Expresión regular para validar formato de placa (3 letras + 3 números)
    const placaRegex = /^[A-Z]{3}\d{3}$/;
    
    // Si está vacío, no mostrar error
    if (placa === "") {
        input.classList.remove("input-error");
        errorElement.style.display = "none";
        return;
    }
    
    // Validar longitud y formato
    if (placa.length < 6) {
        input.classList.add("input-error");
        errorElement.textContent = "La placa debe tener 6 caracteres (3 letras + 3 números)";
        errorElement.style.display = "block";
    } else if (!placaRegex.test(placa)) {
        input.classList.add("input-error");
        errorElement.textContent = "Formato incorrecto. Use 3 letras seguidas de 3 números (Ej: ABC123)";
        errorElement.style.display = "block";
    } else {
        input.classList.remove("input-error");
        errorElement.style.display = "none";
    }
    
    // Forzar mayúsculas
    input.value = placa;
}
