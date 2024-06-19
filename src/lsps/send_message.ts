import { getGrpcClients, grpcMakeUnaryRequest } from '../grpc.js';
import { lnrpc } from '../proto.js';
import { MESSAGE_TYPE, hexStringToBytes, stringToHexString } from '../utils.js';

const { lightning, router } = getGrpcClients();

export const sendMessage = async (pubkey: string, message: string) => {
  const request = lnrpc.SendCustomMessageRequest.encode({
    data: hexStringToBytes(stringToHexString(message)),
    peer: hexStringToBytes(pubkey),
    type: MESSAGE_TYPE,
  }).finish();

  const response = await grpcMakeUnaryRequest<lnrpc.SendCustomMessageResponse>(
    lightning,
    '/lnrpc.Lightning/SendCustomMessage',
    request,
    lnrpc.SendCustomMessageResponse.decode,
  );

  return response;
};

export const sendErrorMessage = async (pubkey: string, message: string) => {
  const request = lnrpc.SendCustomMessageRequest.encode({
    data: hexStringToBytes(stringToHexString(message)),
    peer: hexStringToBytes(pubkey),
    type: MESSAGE_TYPE,
  }).finish();

  const response = await grpcMakeUnaryRequest<lnrpc.SendCustomMessageResponse>(
    lightning,
    '/lnrpc.Lightning/SendCustomMessage',
    request,
    lnrpc.SendCustomMessageResponse.decode,
  );

  return response;
};
