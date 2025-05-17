import axios from 'axios';

const apiService = {
  // Capture image from ESP32-CAM
  captureImage: async (espIpAddress) => {
    try {
      const response = await axios.get(`http://${espIpAddress}/jpg`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error capturing image:', error);
      throw error;
    }
  },

  // Send image to AI server for face recognition
  recognizeFace: async (imageBlob) => {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob);

      // Ganti URL dengan endpoint AI cloud Anda
      const response = await axios.post('https://lwfrdebug.onrender.com/recognize-face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error sending image to AI server:', error);
      throw error;
    }
  },
  
  // Convert Blob to Base64
  blobToBase64: (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },
  
  // Send image to AI server with Base64 encoding (format yang digunakan di kode ESP32)
  recognizeFaceBase64: async (imageBlob) => {
    try {
      const base64Image = await apiService.blobToBase64(imageBlob);
      
      const payload = {
        image_base64: base64Image
      };
      
      // Gunakan URL yang sama dengan yang ada di kode ESP32
      const response = await axios.post('https://lwfrdebug.onrender.com/recognize-face', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error sending image to AI server:', error);
      throw error;
    }
  }
};

export default apiService;