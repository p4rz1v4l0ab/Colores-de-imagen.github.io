document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const uploadedImage = document.getElementById('uploaded-image');
    const colorAnalysisCanvas = document.getElementById('color-analysis-canvas');
    const ctx = colorAnalysisCanvas.getContext('2d');
    const instructionMessage = document.getElementById('instruction-message');
    const colorResultsContainer = document.getElementById('color-results-container');
    const colorPalette = document.getElementById('color-palette');

    // Función para convertir RGB a formato HEX
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    // Función principal para analizar los colores
    function analyzeColors(img) {
        // Asegurarse de que el canvas tenga el tamaño de la imagen para un análisis completo
        colorAnalysisCanvas.width = img.width;
        colorAnalysisCanvas.height = img.height;

        // Dibujar la imagen en el canvas
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Obtener los datos de los píxeles
        const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
        const colorCounts = {}; // Objeto para almacenar la frecuencia de cada color RGB

        // Iterar sobre los píxeles (cada 4 valores son R, G, B, A)
        // Optimizamos saltando píxeles para imágenes muy grandes
        const pixelStep = 4; // Analizar cada 4º píxel en cada fila, para no saturar con imágenes grandes
                           // Puedes ajustar este valor: 1 para más precisión, mayor para más velocidad
        for (let i = 0; i < imageData.length; i += 4 * pixelStep) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            // const a = imageData[i + 3]; // Canal alfa, si fuera necesario

            // Crear una clave única para el color RGB
            const rgbKey = `${r},${g},${b}`;

            if (colorCounts[rgbKey]) {
                colorCounts[rgbKey]++;
            } else {
                colorCounts[rgbKey] = 1;
            }
        }

        // Convertir el objeto a un array y ordenar por frecuencia (más predominante primero)
        const sortedColors = Object.entries(colorCounts).sort(([, countA], [, countB]) => countB - countA);

        // Limpiar la paleta de colores anterior
        colorPalette.innerHTML = '';

        // Mostrar los 10 colores más predominantes (o menos si hay menos de 10)
        const maxColorsToShow = 10;
        for (let i = 0; i < Math.min(sortedColors.length, maxColorsToShow); i++) {
            const [rgbKey, count] = sortedColors[i];
            const [r, g, b] = rgbKey.split(',').map(Number);
            const hexColor = rgbToHex(r, g, b);

            const colorSwatch = document.createElement('div');
            colorSwatch.classList.add('color-swatch');
            colorSwatch.style.backgroundColor = hexColor;
            colorSwatch.title = `Color: ${hexColor}\nFrecuencia: ${count}`; // Título al pasar el ratón

            const colorHexSpan = document.createElement('span');
            colorHexSpan.classList.add('color-hex');
            colorHexSpan.textContent = hexColor;

            colorSwatch.appendChild(colorHexSpan);
            colorPalette.appendChild(colorSwatch);
        }

        colorResultsContainer.classList.remove('hidden');
    }

    // Manejar la carga de la imagen
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Ocultar mensaje de instrucción y mostrar imagen cargada
                    instructionMessage.classList.add('hidden');
                    uploadedImage.src = e.target.result;
                    uploadedImage.classList.remove('hidden');

                    // Realizar el análisis de colores
                    analyzeColors(img);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            // Si no se selecciona ningún archivo, restablecer la vista
            instructionMessage.classList.remove('hidden');
            uploadedImage.classList.add('hidden');
            colorResultsContainer.classList.add('hidden');
            colorPalette.innerHTML = '';
        }
    });
});


