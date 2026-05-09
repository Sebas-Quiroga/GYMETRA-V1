export const resizeImage = (file: File, maxSize: number = 150): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('No se pudo obtener el contexto del canvas'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const aspectRatio = width / height;

      if (width > height) {
        width = Math.min(width, maxSize);
        height = width / aspectRatio;
      } else {
        height = Math.min(height, maxSize);
        width = height * aspectRatio;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.8;
      let base64 = canvas.toDataURL('image/jpeg', quality);

      while (base64.length > 100000 && quality > 0.1) {
        quality -= 0.1;
        base64 = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(base64);
    };

    img.onerror = () => reject(new Error('Error al procesar la imagen'));
    img.src = URL.createObjectURL(file);
  });
};
