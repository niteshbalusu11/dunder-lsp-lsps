export const bytesToHexString = (bytes: Buffer | Uint8Array) => {
  return bytes.reduce(function (memo, i) {
    return memo + ('0' + i.toString(16)).slice(-2); //padd with leading 0 if <16
  }, '');
};

// Decode contents of the incoming message
export const decodeMessage = (buffer: Buffer | Uint8Array) => {
  return Buffer.from(bytesToHexString(buffer), 'hex').toString();
};

// Encode message to send
export const encodeMessage = (message: string) => {
  return hexStringToBytes(stringToHexString(message));
};
// Convert to string to hex string
export const stringToHexString = (str: string) => {
  return Buffer.from(str).toString('hex');
};

// Convert a hex string to a buffer
export const hexStringToBytes = (hex: string) => {
  return Buffer.from(hex, 'hex');
};

// Make the error message
export const makeErrorMessage = (
  id: string,
  code: number,
  data: { message: string; property: string },
  message: string,
) => {
  return { id, error: { code, data, message }, jsonrpc: '2.0' };
};

export const MESSAGE_TYPE = 37913;

export const errorCodes = {
  invalidParameters: -32606,
  resourceNotFound: 404,
  optionMismatch: 1000,
};

export const lsps1Methods = {
  get_info: 'lsps1.get_info',
  create_order: 'lsps1.create_order',
  get_order: 'lsps1.get_order',
};
