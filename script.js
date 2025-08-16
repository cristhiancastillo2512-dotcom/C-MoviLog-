// Configuración e inicialización de Firebase usando CDN
document.addEventListener('DOMContentLoaded', function() {
  // Inicializa Firebase con la configuración de tu proyecto
  const firebaseConfig = {
    apiKey: "AIzaSyCJvJ784QAnGTSS3apP-c-2iFLh4ZsEuSI",
    authDomain: "c-movilong.firebaseapp.com",
    projectId: "c-movilong",
    storageBucket: "c-movilong.appspot.com",
    messagingSenderId: "91828137101",
    appId: "1:91828137101:web:0678e36a74562c82ba06c4",
    measurementId: "G-YN5MCGTLGE"
  };

  // Inicializa Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // Constantes
  const PLACA_REGEX = /^[A-ZÑ]{3}\d{3}$/;
  const CEDULA_REGEX = /^\d{7,15}$/;
  
  // Cache de elementos DOM
  const elements = {
    formulario: getElement('miFormulario'),
    placaInput: getElement('placa'),
    marcaSelect: getElement('marca'),
    modeloInput: getElement('modelo'),
    propietarioInput: getElement('propietario'),
    cedulaInput: getElement('cedula'),
    llegadaInput: getElement('llegada'),
    btnGuardar: getElement('btnGuardar'),
    btnConsultar: getElement('btnConsultar'),
    resultadoDiv: getElement('resultado')
  };

  // Valida elementos esenciales
  if (!elements.formulario || !elements.placaInput || !elements.btnGuardar || !elements.btnConsultar) {
    console.error('Elementos esenciales no encontrados');
    return;
  }

  // Inicializa la aplicación
  initApp();

  function initApp() {
    // Configura event listeners
    elements.btnGuardar.addEventListener('click', handleSave);
    elements.btnConsultar.addEventListener('click', handleConsult);
    elements.formulario.addEventListener('submit', (e) => e.preventDefault());
    
    // Establece fecha y hora actual
    setCurrentDateTime();
    
    // Validación en tiempo real
    elements.placaInput.addEventListener('input', () => validatePlaca(elements.placaInput));
    if (elements.cedulaInput) {
      elements.cedulaInput.addEventListener('input', () => validateCedula(elements.cedulaInput));
    }
  }

  // Funciones utilitarias
  function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Elemento con ID '${id}' no encontrado`);
    }
    return element;
  }

  function setCurrentDateTime() {
    if (!elements.llegadaInput) return;
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now - timezoneOffset).toISOString().slice(0, 16);
    elements.llegadaInput.value = localISOTime;
  }

  // Manejadores de eventos
  async function handleSave() {
    if (!validateForm()) {
      showResult('Por favor complete todos los campos requeridos correctamente', 'error');
      return;
    }

    try {
      const vehicleData = prepareVehicleData();
      await saveVehicle(vehicleData);
      
      showResult('Registro guardado exitosamente', 'success');
      elements.formulario.reset();
      setCurrentDateTime();
    } catch (error) {
      console.error('Error al guardar:', error);
      showResult(error.message || 'Error al guardar el registro', 'error');
    }
  }

  async function handleConsult() {
    const placa = elements.placaInput.value.trim().toUpperCase();
    
    if (!validatePlaca(elements.placaInput)) {
      return;
    }

    try {
      const vehicleData = await getVehicle(placa);
      displayVehicleInfo(vehicleData);
    } catch (error) {
      console.error('Error al consultar:', error);
      showResult(error.message || 'Error al recuperar datos del vehículo', 'error');
    }
  }

  // Preparación de datos
  function prepareVehicleData() {
    return {
      placa: elements.placaInput.value.toUpperCase(),
      marca: elements.marcaSelect?.value || '',
      modelo: elements.modeloInput?.value || '',
      propietario: elements.propietarioInput?.value || '',
      cedula: elements.cedulaInput?.value || '',
      llegada: elements.llegadaInput?.value || new Date().toISOString(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
  }

  // Funciones de validación
  function validateForm() {
    let isValid = true;
    
    if (!validatePlaca(elements.placaInput)) isValid = false;
    if (elements.marcaSelect && !elements.marcaSelect.value) {
      showError(elements.marcaSelect, 'Seleccione una marca');
      isValid = false;
    }
    if (elements.modeloInput && !elements.modeloInput.value.trim()) {
      showError(elements.modeloInput, 'Ingrese el modelo');
      isValid = false;
    }
    if (elements.propietarioInput && !elements.propietarioInput.value.trim()) {
      showError(elements.propietarioInput, 'Ingrese el nombre del propietario');
      isValid = false;
    }
    if (elements.cedulaInput && !validateCedula(elements.cedulaInput)) {
      isValid = false;
    }
    
    return isValid;
  }

  function validatePlaca(input) {
    if (!input) return false;
    
    const placa = input.value.toUpperCase();
    
    if (!placa) {
      showError(input, 'Placa requerida');
      return false;
    }
    
    if (!PLACA_REGEX.test(placa)) {
      showError(input, 'Formato: ABC123');
      return false;
    }
    
    clearError(input);
    input.value = placa;
    return true;
  }

  function validateCedula(input) {
    if (!input) return true; // Campo opcional
    
    const cedula = input.value.trim();
    
    if (!cedula) {
      showError(input, 'Número de cédula requerido');
      return false;
    }
    
    if (!CEDULA_REGEX.test(cedula)) {
      showError(input, 'Número de cédula inválido (7-15 dígitos)');
      return false;
    }
    
    clearError(input);
    return true;
  }

  // Funciones de UI
  function showError(input, message) {
    if (!input) return;
    input.classList.add('input-error');
    const errorElement = input.nextElementSibling;
    if (errorElement?.classList.contains('error-message')) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  function clearError(input) {
    if (!input) return;
    input.classList.remove('input-error');
    const errorElement = input.nextElementSibling;
    if (errorElement?.classList.contains('error-message')) {
      errorElement.style.display = 'none';
    }
  }

  function showResult(message, type) {
    if (!elements.resultadoDiv) return;
    elements.resultadoDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    elements.resultadoDiv.style.display = 'block';
  }

  function displayVehicleInfo(data) {
    if (!elements.resultadoDiv) return;
    
    if (!data) {
      showResult('Vehículo no encontrado', 'warning');
      return;
    }
    
    elements.resultadoDiv.innerHTML = `
      <div class="vehicle-info">
        <h2>Información del Vehículo</h2>
        <div class="info-grid">
          ${createInfoRow('Placa', data.placa)}
          ${createInfoRow('Marca', data.marca)}
          ${createInfoRow('Modelo', data.modelo)}
          ${createInfoRow('Propietario', data.propietario)}
          ${createInfoRow('Cédula', data.cedula)}
          ${createInfoRow('Fecha de Entrada', formatDateTime(data.llegada))}
        </div>
      </div>
    `;
    elements.resultadoDiv.style.display = 'block';
  }

  function createInfoRow(label, value) {
    return `
      <div><strong>${label}:</strong></div>
      <div>${value || 'N/A'}</div>
    `;
  }

  function formatDateTime(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString();
  }

  // Operaciones con Firebase
  async function saveVehicle(vehicleData) {
    try {
      await db.collection("vehicles").doc(vehicleData.placa).set(vehicleData);
      return vehicleData;
    } catch (error) {
      console.error("Error al guardar vehículo:", error);
      throw new Error("Error al guardar datos del vehículo");
    }
  }

  async function getVehicle(placa) {
    try {
      const docRef = db.collection("vehicles").doc(placa);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        return docSnap.data();
      } else {
        throw new Error("Vehículo no encontrado");
      }
    } catch (error) {
      console.error("Error al obtener vehículo:", error);
      throw error;
    }
  }
});
