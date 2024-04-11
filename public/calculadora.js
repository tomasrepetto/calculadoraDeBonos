document.addEventListener('DOMContentLoaded', function() {
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

    document.getElementById('bondName').addEventListener('change', function() {
        const selectedSymbol = this.value;
        fetch('datos.json')
        .then(response => response.json())
        .then(data => {
            const selectedBond = data.bonos.find(bono => bono.id === selectedSymbol);
            if (selectedBond && selectedBond.tipoCambio) {
                document.getElementById('tipoCambioTexto').innerText = `Tipo de cambio: ${selectedBond.tipoCambio}`;
            } else {
                // Puedes manejar el caso de no encontrar el bono o no tener tipo de cambio definido.
                document.getElementById('tipoCambioTexto').innerText = 'Tipo de cambio no disponible';
            }
        })
        .catch(error => console.error('Error al procesar la selección de bonos:', error));
    });
});

// Asegúrate de implementar y llamar a las funciones que manejan los cálculos
// cuando sea necesario, por ejemplo después de un evento 'submit' en tu formulario.

// Elegir cantidad de titulos o importe

document.addEventListener('DOMContentLoaded', function() {
document.getElementById('opcionCalculo').addEventListener('change', actualizarPlaceholder);
document.getElementById('inputCantidad').addEventListener('input', calcularResultado);
document.getElementById('precio').addEventListener('input', calcularResultado);

    function actualizarPlaceholder() {
        const opcion = document.getElementById('opcionCalculo').value;
        const inputCantidad = document.getElementById('inputCantidad');
        if (opcion === 'cantidadTitulos') {
            inputCantidad.placeholder = "Cantidad de Títulos";
        } else {
            inputCantidad.placeholder = "Monto a invertir";
        }
        // Limpia el resultado al cambiar la opción
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

        const valor = parseFloat(valorInput);
        const precio = parseFloat(precioInput);
        let resultado;

        if (opcion === 'montoInvertir' && precio > 0) {
            resultado = valor / precio * 100;
        } else {
            resultado = valor; // Se mantiene el valor ingresado sin cambios
        }

        document.getElementById('resultadoCalculo').innerText = `Nominales a adquirir: ${Math.round(resultado).toLocaleString('de-DE')}`; // Redondea el resultado para no mostrar decimales
    }

    actualizarPlaceholder(); // Para establecer el placeholder correcto al cargar la página
});


// Calcular FECHAS

document.getElementById('bondForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fechaUsuario = new Date(document.getElementById('startDate').value);
    const bonoSeleccionado = document.getElementById('bondName').value;
    const cantidadTitulos = parseFloat(document.getElementById('inputCantidad').value); // Asegúrate de que este campo exista y esté lleno

    fetch('datos.json')
    .then(response => response.json())
    .then(data => {
        const bono = data.bonos.find(b => b.id === bonoSeleccionado);
        if (bono && bono.fechaInicio && !isNaN(cantidadTitulos)) {
            const fechaInicioBono = new Date(bono.fechaInicio);
            const fechasDesdeUsuario = agregarFechasDesdeUsuario(fechaInicioBono, fechaUsuario);
            actualizarResultados(fechasDesdeUsuario, cantidadTitulos); // Pasando cantidadTitulos correctamente
        } else {
            console.error('Error: Datos del bono incompletos o cantidad de títulos no válida.');
        }
    })
    .catch(error => console.error('Error al obtener datos del bono:', error));
});


function agregarFechasDesdeUsuario(fechaInicio, fechaUsuario) {
    const fechas = [];
    let fechaActual = new Date(fechaInicio);

    // Asegúrate de que la fecha de inicio sea anterior a la fecha del usuario.
    while(fechaActual <= fechaUsuario) {
        fechaActual.setMonth(fechaActual.getMonth() + 6);
    }

    const fechaFinal = new Date(fechaInicio);
    fechaFinal.setFullYear(fechaFinal.getFullYear() + 10);
    fechaFinal.setMonth(fechaFinal.getMonth() + 1); // Añadir 6 meses adicionales para los 10 años y medio

    // Ahora, comienza a agregar fechas desde la fecha del usuario hasta 10 años y medio después de la fecha de inicio.
    while (fechaActual <= fechaFinal) {
        fechas.push(new Date(fechaActual));
        fechaActual.setMonth(fechaActual.getMonth() + 6);
    }

    return fechas;
}

function actualizarResultados(fechas, cantidadTitulos) {
    const tbody = document.querySelector('#result tbody');
    tbody.innerHTML = '';
    let fechaInicio = true;

    // Variables para acumular totales
    let totalAmortizacion = 0;
    let amortizacionAnterior = 0; // Para almacenar la amortización de la fila anterior
    let valorResidualActual = cantidadTitulos / 100; // Calcula el primer valor residual fuera del bucle
    let totalValorResidual = 0;

    fechas.forEach((fecha, index) => {
        let amortizacion;

        if (fechaInicio) {
            amortizacion = cantidadTitulos / 25; // Primer valor en la primera fila
            fechaInicio = false;
        } else {
            amortizacion = cantidadTitulos / 12.5; // Resto de valores en las siguientes filas
        }

        // Acumula el total de amortización
        totalAmortizacion += amortizacion;

        if (index !== 0) { // Desde la segunda fila en adelante
            valorResidualActual -= amortizacionAnterior / 100;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatearFecha(fecha)}</td>
            <td>${valorResidualActual.toLocaleString('de-DE')}</td>  <!-- Valor Residual calculado y formateado -->
            <td></td>  <!-- Interes vacío -->
            <td>${amortizacion.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>  <!-- Amortización formateada -->
            <td></td>  <!-- Total vacío -->
        `;
        tbody.appendChild(tr);

        // Guardar la amortización actual para usarla en la siguiente iteración
        amortizacionAnterior = amortizacion;
    });

    // Actualizar el total de amortización en el pie de tabla
    document.getElementById('totalAmortizacion').textContent = totalAmortizacion.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}


function actualizarResultados(fechas, cantidadTitulos) {
    const tbody = document.querySelector('#result tbody');
    tbody.innerHTML = '';
    let fechaInicio = true;

    // Variables para acumular totales
    let totalAmortizacion = 0;
    let totalInteres = 0;  // Variable para acumular el total de interés
    let totalGeneral = 0;  // Variable para acumular el total general (interés + amortización)
    let amortizacionAnterior = 0; // Para almacenar la amortización de la fila anterior
    let valorResidualActual = cantidadTitulos / 100; // Calcula el primer valor residual fuera del bucle
    let totalValorResidual = 0; // No usada en este ejemplo, pero definida para completitud

    fechas.forEach((fecha, index) => {
        let amortizacion, interes, total;
        let tasaAnualInteres;

        if (fechaInicio) {
            amortizacion = cantidadTitulos / 25; // Primer valor en la primera fila
            fechaInicio = false;
        } else {
            amortizacion = cantidadTitulos / 12.5; // Resto de valores en las siguientes filas
        }

        // Acumula el total de amortización
        totalAmortizacion += amortizacion;

        if (index !== 0) { // Desde la segunda fila en adelante
            valorResidualActual -= amortizacionAnterior / 100;
        }

        // Asignar la tasa de interés basada en el número de fila
        if (index < 6) {
            tasaAnualInteres = 0.0075; // 0.75% para las primeras 6 filas
        } else {
            tasaAnualInteres = 0.0175; // 1.75% para el resto
        }

        // Calcular el interés según la fórmula dada
        interes = (cantidadTitulos * (valorResidualActual / 100) * tasaAnualInteres) / 2;

        // Acumula el total de interés
        totalInteres += interes;

        // Calcula el total sumando interés y amortización
        total = interes + amortizacion;

        // Acumula el total general
        totalGeneral += total;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatearFecha(fecha)}</td>
            <td>${Math.round(valorResidualActual).toLocaleString('de-DE')}</td>  <!-- Valor Residual calculado y formateado sin decimales -->
            <td>${interes.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>  <!-- Interés calculado y formateado -->
            <td>${amortizacion.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>  <!-- Amortización formateada -->
            <td>${total.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>  <!-- Total calculado y formateado -->
        `;
        tbody.appendChild(tr);

        // Guardar la amortización actual para usarla en la siguiente iteración
        amortizacionAnterior = amortizacion;
    });

    // Actualizar el total de amortización, el total de interés y el total general en el pie de tabla
    document.getElementById('totalAmortizacion').textContent = totalAmortizacion.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('totalInteres').textContent = totalInteres.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('totalGeneral').textContent = totalGeneral.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}


function formatearFecha(fecha) {
    const dia = ('0' + fecha.getDate()).slice(-2);
    const mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
    const año = fecha.getFullYear();
    return `${dia}-${mes}-${año}`;
}

