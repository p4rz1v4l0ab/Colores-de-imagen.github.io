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
        // Ocultar la imagen <img> y mostrar el canvas
        uploadedImage.classList.add('hidden');
        colorAnalysisCanvas.classList.remove('hidden');

        // Calcular el tamaño máximo del canvas basado en el contenedor
        // Esto asegura que el canvas no se desborde del área de visualización
        const maxCanvasWidth = colorAnalysisCanvas.parentElement.clientWidth - 40; // Resta el padding del contenedor
        const maxCanvasHeight = 500; // Un alto máximo razonable para el canvas

        // Redimensionar el canvas para que la imagen quepa bien sin distorsión
        // y sin ser demasiado grande para la pantalla
        let aspectRatio = img.width / img.height;
        let newWidth = maxCanvasWidth;
        let newHeight = newWidth / aspectRatio;

        if (newHeight > maxCanvasHeight) {
            newHeight = maxCanvasHeight;
            newWidth = newHeight * aspectRatio;
        }

        // Asegurarse de que el canvas no exceda el tamaño original de la imagen si es pequeña
        if (newWidth > img.width) newWidth = img.width;
        if (newHeight > img.height) newHeight = img.height;


        colorAnalysisCanvas.width = newWidth;
        colorAnalysisCanvas.height = newHeight;

        // Dibujar la imagen en el canvas, escalándola al nuevo tamaño del canvas
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Obtener los datos de los píxeles
        const imageData = ctx.getImageData(0, 0, newWidth, newHeight).data;
        const colorCounts = {}; // Objeto para almacenar la frecuencia de cada color RGB

        // Iterar sobre los píxeles (cada 4 valores son R, G, B, A)
        // Optimizamos saltando píxeles para imágenes muy grandes.
        // El pixelStep se puede ajustar. Un valor de 1 analizará cada píxel.
        // Un valor mayor reducirá la precisión pero aumentará el rendimiento.
        const pixelStep = 4; // Analizar cada 4º píxel (salto de 4x4 en el grid)

        for (let i = 0; i < imageData.length; i += 4 * pixelStep) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            // Si el píxel es completamente transparente o casi transparente, podemos ignorarlo
            // const a = imageData[i + 3];
            // if (a < 50) continue; // Por ejemplo, ignorar píxeles con alfa muy bajo

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
            instructionMessage.classList.add('hidden'); // Ocultar mensaje inicial
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    analyzeColors(img);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            // Si no se selecciona ningún archivo, restablecer la vista
            instructionMessage.classList.remove('hidden');
            uploadedImage.classList.add('hidden'); // Asegurarse de que img esté oculta
            colorAnalysisCanvas.classList.add('hidden'); // Asegurarse de que canvas esté oculto
            colorResultsContainer.classList.add('hidden');
            colorPalette.innerHTML = '';
        }
    });

    // Ocultar el canvas y la imagen al inicio, mostrar el mensaje
    uploadedImage.classList.add('hidden');
    colorAnalysisCanvas.classList.add('hidden');
    instructionMessage.classList.remove('hidden');
});
