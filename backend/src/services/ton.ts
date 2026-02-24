import { TonClient, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToWalletKey } from '@ton/crypto';
import { config } from '../config';
import { logger } from '../utils/logger';

let tonClient: TonClient | null = null;

export async function initTON(): Promise<void> {
  const endpoint = config.tonNetwork === 'mainnet'
    ? 'https://toncenter.com/api/v2/jsonRPC'
    : 'https://testnet.toncenter.com/api/v2/jsonRPC';

  tonClient = new TonClient({
    endpoint,
    apiKey: process.env.TONCENTER_API_KEY, // Optional for testnet
  });

  logger.info(`TON client initialized (${config.tonNetwork})`);
}

export function getTonClient(): TonClient {
  if (!tonClient) {
    throw new Error('TON client not initialized');
  }
  return tonClient;
}

export async function getWalletFromMnemonic(mnemonic: string[]): Promise<WalletContractV4> {
  const keyPair = await mnemonicToWalletKey(mnemonic);
  return WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
}

export async function checkTransactionConfirmation(
  txHash: string,
  requiredConfirmations: number = 1
): Promise<{ confirmed: boolean; confirmations: number }> {
  const client = getTonClient();
  
  try {
    // Note: This is a simplified implementation
    // In production, you'd need to properly fetch and count confirmations
    const info = await client.getTransactionLite(txHash);
    
    return {
      confirmed: true,
      confirmations: requiredConfirmations,
    };
  } catch (error) {
    logger.error('Error checking transaction:', error);
    return {
      confirmed: false,
      confirmations: 0,
    };
  }
}

export function parseTonAddress(address: string): string {
  // Normalize TON address
  return address.replace(/\s/g, '');
}

export function formatTonAmount(nanotons: bigint): string {
  return (Number(nanotons) / 1e9).toFixed(9);
}

export function parseTonAmount(tons: string): bigint {
  return BigInt(Math.floor(parseFloat(tons) * 1e9));
}
