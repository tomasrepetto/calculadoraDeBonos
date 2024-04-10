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
            calcularResultado();
        } else {
            inputCantidad.placeholder = "Monto a invertir";
            calcularResultado();
        }
    }

    function calcularResultado() {
        const opcion = document.getElementById('opcionCalculo').value;
        const valor = parseFloat(document.getElementById('inputCantidad').value);
        const precio = parseFloat(document.getElementById('precio').value);
        let resultado = 0;
        
        if (opcion === 'montoInvertir' && precio > 0) {
            resultado = valor / precio * 100;
        } else {
            resultado = valor;
        }
        
        document.getElementById('resultadoCalculo').innerText = `Cantidad de titulos a invertir: ${resultado.toFixed(2)}`;
    }

    actualizarPlaceholder(); // Para establecer el placeholder correcto al cargar la página
});

// Calcular FECHAS

document.getElementById('bondForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // La fecha que ingresa el usuario
    const fechaUsuario = new Date(document.getElementById('startDate').value);
    
    // Obtén el bono seleccionado y su fecha de inicio del JSON
    const bonoSeleccionado = document.getElementById('bondName').value;
    fetch('datos.json')
    .then(response => response.json())
    .then(data => {
        const bono = data.bonos.find(b => b.id === bonoSeleccionado);
        if (bono && bono.fechaInicio) {
            const fechaInicioBono = new Date(bono.fechaInicio);
            const fechasDesdeUsuario = agregarFechasDesdeUsuario(fechaInicioBono, fechaUsuario);
            actualizarResultados(fechasDesdeUsuario);
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

    // Ahora, comienza a agregar fechas desde la fecha del usuario.
    while (fechaActual <= new Date(fechaInicio.getFullYear() + 10, fechaInicio.getMonth())) {
        fechas.push(new Date(fechaActual));
        fechaActual.setMonth(fechaActual.getMonth() + 6);
    }

    return fechas;
}

function actualizarResultados(fechas) {
    const tbody = document.querySelector('#result tbody');
    tbody.innerHTML = '';

    fechas.forEach(fecha => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatearFecha(fecha)}</td>
            <td>...</td>
            <td>...</td>
            <td>...</td>
            <td>...</td>
        `;
        tbody.appendChild(tr);
    });
}

function formatearFecha(fecha) {
    const dia = ('0' + fecha.getDate()).slice(-2);
    const mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
    const año = fecha.getFullYear();
    return `${dia}-${mes}-${año}`;
}
