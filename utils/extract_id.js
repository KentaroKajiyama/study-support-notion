import logger from './logger';
const extract_id = (url) => {
  try {
    if (typeof url !== 'string'){
      throw new Error('Invalid input: URL must be a string.');
    }
    const regex = /([a-f0-9]{32})/
    const match = url.match(regex)
    if (!match){
      throw new Error('Invalid URL: No ID found.');
    }
    return match[1];
  } catch(error) {
    logger.error(error.message);
    return null;
  }
}

export default extract_id;