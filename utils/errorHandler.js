// errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong!' });
}


export class validator {
  validateDate(string){
    const dateRegix = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegix.test(string) && !isNaN(Date.parse(string));
  };
  validateEmail(string){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(string);
  };
  validatePhoneNumber(string){
    const phoneRegex = /^\+?[1-9]\d{1,14}$|^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    return phoneRegex.test(string);
  }
  validateURL(url) {
    const urlRegex = /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
    return urlRegex.test(url);
  }
}