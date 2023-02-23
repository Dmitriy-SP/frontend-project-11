export default (data) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(data, 'application/xml');
  const parseError = parsedData.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    throw error;
  }
  return parsedData;
};
