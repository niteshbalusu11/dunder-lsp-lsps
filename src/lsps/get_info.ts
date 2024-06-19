import { z } from 'zod';
import config from '../../config/config.json' with { type: 'json' };
import { sendMessage } from './send_message.js';
import { tryAsync } from '@eznix/try';

const lsps1_getInfo = z.object({
  id: z.string(),
  method: z.literal('lsps1.get_info'),
  jsonrpc: z.literal('2.0'),
  params: z.object({}),
});

export type TypeLsps1GetInfo = z.infer<typeof lsps1_getInfo>;

export const validateGetInfo = (data: string) => {
  return lsps1_getInfo.safeParse(JSON.parse(data));
};

const lsps1_getInfo_result = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.string(),
  result: z.object({
    options: z.object({
      max_channel_balance_sat: z.number().max(config.maxCapacity),
      max_channel_expiry_blocks: z.number(),
      max_initial_client_balance_sat: z.number().max(config.maxPushAmount),
      max_initial_lsp_balance_sat: z.number().max(config.maxCapacity),
      min_channel_balance_sat: z.number().min(config.minCapacity),
      min_funding_confirms_within_blocks: z.number().max(config.defaultFundingConfirmedBlocks),
      min_initial_client_balance_sat: z.number().min(config.minPushAmount),
      min_initial_lsp_balance_sat: z.number().min(config.minCapacity),
      min_onchain_payment_confirmations: z.null(),
      min_onchain_payment_size_sat: z.null(),
      min_required_channel_confirmations: z.number().min(0).max(config.defaultChannelActiveConfs),
      supports_zero_channel_reserve: z.boolean(),
    }),
  }),
});

export type TypeLsps1GetInfoResult = z.infer<typeof lsps1_getInfo_result>;

export const sendGetInfo = async (data: TypeLsps1GetInfo, pubkey: string) => {
  const channelConfs = config.allowZeroConfChannels
    ? config.defaultChannelActiveConfsZeroConf
    : config.defaultChannelActiveConfs;

  const options = {
    max_channel_balance_sat: config.maxCapacity,
    max_channel_expiry_blocks: config.defaultLifetimeBlocks,
    max_initial_client_balance_sat: config.maxPushAmount,
    max_initial_lsp_balance_sat: config.maxCapacity,
    min_channel_balance_sat: config.minCapacity,
    min_funding_confirms_within_blocks: config.defaultFundingConfirmedBlocks,
    min_initial_client_balance_sat: config.minPushAmount,
    min_initial_lsp_balance_sat: config.minCapacity,
    min_onchain_payment_confirmations: null,
    min_onchain_payment_size_sat: null,
    min_required_channel_confirmations: channelConfs,
    supports_zero_channel_reserve: false,
  };

  const responseForValidation = {
    jsonrpc: '2.0',
    id: data.id,
    result: {
      options,
    },
  };

  const res = lsps1_getInfo_result.safeParse(responseForValidation);

  if (!res.success) {
    console.error(res.error);
  } else {
    const responseForSending = {
      ...responseForValidation,
      result: {
        options: {
          ...options,
          max_channel_balance_sat: options.max_channel_balance_sat.toString(),
          max_initial_client_balance_sat: options.max_initial_client_balance_sat.toString(),
          max_initial_lsp_balance_sat: options.max_initial_lsp_balance_sat.toString(),
          min_channel_balance_sat: options.min_channel_balance_sat.toString(),
          min_initial_client_balance_sat: options.min_initial_client_balance_sat.toString(),
          min_initial_lsp_balance_sat: options.min_initial_lsp_balance_sat.toString(),
        },
      },
    };

    const { error } = await (
      await tryAsync(() => sendMessage(pubkey, JSON.stringify(responseForSending)))
    ).promise;

    if (!!error) {
      console.error(error);
    }
  }
};
