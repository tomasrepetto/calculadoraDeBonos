document.getElementById('bondForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obtener los valores del formulario
    var bondName = document.getElementById('bondName').value;
    var date = document.getElementById('date').value;
    var quantity = parseFloat(document.getElementById('quantity').value);
    var price = parseFloat(document.getElementById('price').value);
    var exchangeRate = parseFloat(document.getElementById('exchangeRate').value);
    
    // Aquí puedes agregar la lógica para calcular lo que necesites con estos valores
    // Por ejemplo, un cálculo ficticio (cambia esto por tu lógica real):
    var result = quantity * price * exchangeRate; // Sustituye esto por el cálculo real

    // Mostrar el resultado
    document.getElementById('result').innerText = `Resultado: ${result}`;
    });
