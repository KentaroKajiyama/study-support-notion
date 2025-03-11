const logger = {
  info: (...message) => console.log(`[INFO] ${message.join(' ')}`),
  error: (...message) => console.error(`[ERROR] ${message.join(' ')}`),
};

export default logger;