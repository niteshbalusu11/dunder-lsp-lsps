import { Metadata } from '@grpc/grpc-js';
import { getGrpcClients } from './grpc.js';

const { lightning, router } = getGrpcClients();
import { lnrpc, routerrpc } from './proto.js';
import { MESSAGE_TYPE, bytesToHexString, decodeMessage, lsps1Methods } from './utils.js';
import { sendGetInfo, validateGetInfo } from './lsps/get_info.js';

const main = async () => {
  // Subscribe to messages
  const request = lnrpc.SubscribeCustomMessagesRequest.encode({}).finish();
  const sub = lightning.makeServerStreamRequest(
    '/lnrpc.Lightning/SubscribeCustomMessages',
    (arg: any) => arg,
    (arg) => arg,
    request,
    new Metadata(),
    undefined,
  );

  sub.on('data', async (data: Buffer) => {
    const message = lnrpc.CustomMessage.decode(data);

    // Ignore if its not a lsps1 message
    if (message.type !== MESSAGE_TYPE) {
      return;
    }

    // Return if its not a valid json message
    try {
      JSON.parse(decodeMessage(message.data));
    } catch (e) {
      return;
    }

    const decodedMessage = decodeMessage(message.data);
    const parsedData: unknown = JSON.parse(decodedMessage);

    if (typeof parsedData !== 'object' || parsedData === null || !('method' in parsedData)) {
      return;
    }

    switch (parsedData.method) {
      case lsps1Methods.get_info: {
        const lsps1_getInfo = validateGetInfo(decodedMessage);
        if (lsps1_getInfo.success) {
          await sendGetInfo(lsps1_getInfo.data, bytesToHexString(message.peer));
        }
        break;
      }
      case lsps1Methods.create_order: {
        // TODO: Implement
        break;
      }
      case lsps1Methods.get_order: {
        // TODO: Implement
        break;
      }
      default: {
        console.log('Unknown method', parsedData.method);
        break;
      }
    }
  });

  sub.on('error', () => {
    sub.removeAllListeners();
  });
};

main();
