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
