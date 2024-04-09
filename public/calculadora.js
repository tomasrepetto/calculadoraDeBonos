document.addEventListener('DOMContentLoaded', function() {
    fetch('./datos.json')
    .then(response => response.json())
    .then(data => {
        const selectElement = document.getElementById('bondName');
        data.forEach(bono => {
            const option = new Option(bono.SIMBOLO, bono.SIMBOLO);
            selectElement.add(option);
        });
    })
    .catch(error => console.error('Error al cargar los bonos:', error));
});

document.getElementById('bondForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('result').innerText = `Cálculo realizado. Verifica la consola para resultados.`;
});

document.getElementById('bondName').addEventListener('change', function() {
    const selectedSymbol = this.value;
    fetch('datos.json') // Asegúrate de que la ruta al archivo sea correcta.
    .then(response => response.json())
    .then(data => {
        const selectedBond = data.find(bono => bono.SIMBOLO === selectedSymbol);
        if (selectedBond) {
            document.getElementById('tipoCambioTexto').innerText = `Tipo de cambio: ${selectedBond.MONEDA}`;
        }
    })
    .catch(error => console.error('Error al cargar los bonos:', error));
});