document.addEventListener('DOMContentLoaded', function() {
    cargarBonos();
    document.getElementById('bondName').addEventListener('change', cambiarTipoCambio);
    document.getElementById('opcionCalculo').addEventListener('change', actualizarPlaceholder);
    document.getElementById('inputCantidad').addEventListener('input', calcularResultado);
    document.getElementById('precio').addEventListener('input', calcularResultado);
    document.getElementById('bondForm').addEventListener('submit', manejarFormularioBonos);
    actualizarPlaceholder(); 
});

function cargarBonos() {
    fetch('datos.json')
    .then(response => response.json())
    .then(data => {
        const selectElement = document.getElementById('bondName');
        data.bonos.forEach(bono => {
            const option = new Option(bono.id, bono.id);
            selectElement.add(option);
        });
    })
    .catch(error => console.error('Error al cargar los bonos:', error));
}

function cambiarTipoCambio() {
    const selectedSymbol = document.getElementById('bondName').value;
    fetch('datos.json')
    .then(response => response.json())
    .then(data => {
        const selectedBond = data.bonos.find(bono => bono.id === selectedSymbol);
        document.getElementById('tipoCambioTexto').innerText = selectedBond ? `Tipo de cambio: ${selectedBond.tipoCambio}` : 'Tipo de cambio no disponible';
        if (selectedBond && selectedBond.fechaLimite) {
            document.getElementById('tipoCambioTexto').setAttribute('data-fecha-limite', selectedBond.fechaLimite);
        }
    })
    .catch(error => console.error('Error al procesar la selección de bonos:', error));
}

function actualizarPlaceholder() {
    const opcion = document.getElementById('opcionCalculo').value;
    document.getElementById('inputCantidad').placeholder = opcion === 'cantidadTitulos' ? "Cantidad de Títulos" : "Monto a invertir";
    document.getElementById('resultadoCalculo').innerText = '';  
}

function calcularResultado() {
    const opcion = document.getElementById('opcionCalculo').value;
    const valorInput = document.getElementById('inputCantidad').value;
    const precioInput = document.getElementById('precio').value;

    if (!valorInput || !precioInput || isNaN(valorInput) || isNaN(precioInput) || precioInput <= 0) {
        document.getElementById('resultadoCalculo').innerText = '';
        return;
    }

    const resultado = opcion === 'montoInvertir' ? (parseFloat(valorInput) / parseFloat(precioInput)) * 100 : parseFloat(valorInput);
    document.getElementById('resultadoCalculo').innerText = `Nominales a adquirir: ${Math.round(resultado).toLocaleString('de-DE')}`;
}

function manejarFormularioBonos(e) {
    e.preventDefault();
    const bonoSeleccionado = document.getElementById('bondName').value;
    fetch('datos.json')
    .then(response => response.json())
    .then(data => {
        const bono = data.bonos.find(b => b.id === bonoSeleccionado);
        if (bono) {
            const fechaPrimerPago = new Date(bono.fechaPrimerPago);
            const fechaLimite = new Date(bono.fechaLimite);
            const fechaObjetivo = new Date(bono.fechaObjetivo);
            const fechaCorte = new Date(bono.fechaCorte); // Cargar fechaCorte desde el JSON
            const fechaUsuario = new Date(document.getElementById('startDate').value);
            const cantidadTitulos = parseFloat(document.getElementById('inputCantidad').value);
            const fechasDesdeUsuario = agregarFechasDesdeUsuario(fechaPrimerPago, fechaLimite, fechaUsuario);
            actualizarResultados(fechasDesdeUsuario, cantidadTitulos, fechaUsuario, fechaObjetivo, fechaCorte); // Pasar fechaCorte a la función
        } else {
            console.error('Error: Datos del bono incompletos.');
        }
    })
    .catch(error => {
        console.error('Error al obtener datos del bono:', error);
    });
}

function agregarFechasDesdeUsuario(fechaPrimerPago, fechaLimite, fechaUsuario) {
    const fechas = [];
    let fechaActual = new Date(Date.UTC(fechaPrimerPago.getFullYear(), fechaPrimerPago.getMonth(), fechaPrimerPago.getDate()));
    let limite = new Date(Date.UTC(fechaLimite.getFullYear(), fechaLimite.getMonth(), fechaLimite.getDate()));
    let usuario = new Date(Date.UTC(fechaUsuario.getFullYear(), fechaUsuario.getMonth(), fechaUsuario.getDate()));

    while (fechaActual <= limite) {
        if (fechaActual >= usuario) {
            let fechaMostrar = new Date(fechaActual.getTime() + (24 * 60 * 60 * 1000)); // Suma 24 horas
            fechas.push(new Date(fechaMostrar.getUTCFullYear(), fechaMostrar.getUTCMonth(), fechaMostrar.getUTCDate()));
        }
        fechaActual.setUTCMonth(fechaActual.getUTCMonth() + 6);
    }

    return fechas;
}

function actualizarResultados(fechas, cantidadTitulos, fechaUsuario, fechaObjetivo, fechaCorte) {
    const tbody = document.querySelector('#result table tbody');
    tbody.innerHTML = '';
    let totalAmortizacion = 0;
    let totalInteres = 0;
    let totalGeneral = 0;
    let totalFftir = 0;
    let residual = 100;  // Iniciar residual con 100

    const usuarioTime = fechaUsuario.getTime();
    const objetivoTime = fechaObjetivo.getTime();

    let sumaAmortizaciones = 0;
    let primerPagoGrandeAplicado = false;
    let ajusteResidualHecho = false;

    fechas.forEach((fecha) => {
        const fechaId = formatearFechaParaId(fecha);
        const tr = document.createElement('tr');
        tr.id = `fecha-${fechaId}`; // Asignar el ID formateado a cada fila

        const fechaTime = fecha.getTime();

        let amortizacion = 0, interes = 0, total = 0, fftir = 0;
        let tasaAnualInteres = fecha >= fechaCorte ? 0.0175 : 0.0075;

        if (!primerPagoGrandeAplicado && usuarioTime <= objetivoTime) {
            amortizacion = cantidadTitulos / 25; // Primer pago grande
            primerPagoGrandeAplicado = true;
        } else {
            amortizacion = cantidadTitulos / 12.5; // Pagos normales
        }

        sumaAmortizaciones += amortizacion;

        if (fecha.getTime() === objetivoTime) {
            residual = cantidadTitulos / 100;
            ajusteResidualHecho = true;
        } else if (fechaTime > objetivoTime && ajusteResidualHecho) {
            residual = sumaAmortizaciones - (cantidadTitulos / 100);
        }

        interes = tasaAnualInteres * 100;
        totalInteres += interes;
        fftir = (interes + amortizacion) / residual;
        total = interes + amortizacion;
        totalAmortizacion += amortizacion;
        totalGeneral += total;
        totalFftir += fftir;

        tr.innerHTML = `
            <td>${formatearFecha(fecha)}</td>
            <td>${Math.round(residual).toLocaleString('de-DE')}</td>
            <td>${interes.toFixed(2).toLocaleString('de-DE')}</td>
            <td>${amortizacion.toFixed(2).toLocaleString('de-DE')}</td>
            <td>${fftir.toFixed(2).toLocaleString('de-DE')}</td>
            <td>${total.toFixed(2).toLocaleString('de-DE')}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('totalAmortizacion').textContent = totalAmortizacion.toFixed(2).toLocaleString('de-DE');
    document.getElementById('totalInteres').textContent = totalInteres.toFixed(2).toLocaleString('de-DE');
    document.getElementById('totalGeneral').textContent = totalGeneral.toFixed(2).toLocaleString('de-DE');
    document.getElementById('totalFftir').textContent = totalFftir.toFixed(2).toLocaleString('de-DE');
}

function formatearFechaParaId(fecha) {
    return `${fecha.getFullYear()}${('0' + (fecha.getMonth() + 1)).slice(-2)}${('0' + fecha.getDate()).slice(-2)}`;
}

function formatearFecha(fecha) {
    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
        console.error('Fecha proporcionada no es válida:', fecha);
        return 'Fecha no válida';
    }

    const dia = ('0' + fecha.getDate()).slice(-2);
    const mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
    const año = fecha.getFullYear();
    return `${dia}-${mes}-${año}`;
}
