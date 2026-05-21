import * as bip39 from 'bip39';
import { HDNodeWallet, Wallet } from 'ethers';
import { Keypair } from '@solana/web3.js';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { ECPairFactory } from 'ecpair';
import bs58 from 'bs58';
import { MultiChainWallet, WalletAccount } from '@/types';

const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

export class WalletService {
  /**
   * Generate a new mnemonic phrase
   */
  static generateMnemonic(): string {
    return bip39.generateMnemonic();
  }

  /**
   * Validate a mnemonic phrase
   */
  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  /**
   * Create EVM wallet from mnemonic
   */
  static createEVMWallet(
    mnemonic: string,
    network: 'ethereum' | 'polygon' | 'binance' | 'base',
    accountIndex: number = 0
  ): WalletAccount {
    const path = `m/44'/60'/0'/0/${accountIndex}`;
    const hdNode = HDNodeWallet.fromPhrase(mnemonic, undefined, path);

    return {
      address: hdNode.address,
      privateKey: hdNode.privateKey,
      publicKey: hdNode.publicKey,
      network,
      balance: '0',
    };
  }

  /**
   * Create Solana wallet from mnemonic
   */
  static createSolanaWallet(
    mnemonic: string,
    accountIndex: number = 0
  ): WalletAccount {
    const seed = bip39.mnemonicToSeedSync(mnemonic, '');
    const path = `m/44'/501'/${accountIndex}'/0'`;
    const derivedSeed = bip32.fromSeed(seed).derivePath(path).privateKey;

    if (!derivedSeed) {
      throw new Error('Failed to derive Solana key');
    }

    const keypair = Keypair.fromSeed(derivedSeed.slice(0, 32));

    return {
      address: keypair.publicKey.toString(),
      privateKey: Buffer.from(keypair.secretKey).toString('hex'),
      publicKey: keypair.publicKey.toString(),
      network: 'solana',
      balance: '0',
    };
  }

  /**
   * Create Bitcoin wallet from mnemonic
   */
  static createBitcoinWallet(
    mnemonic: string,
    accountIndex: number = 0
  ): WalletAccount {
    const seed = bip39.mnemonicToSeedSync(mnemonic, '');
    const path = `m/44'/0'/0'/0/${accountIndex}`;
    const root = bip32.fromSeed(seed);
    const child = root.derivePath(path);

    if (!child.privateKey) {
      throw new Error('Failed to derive Bitcoin key');
    }

    const { address } = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: bitcoin.networks.bitcoin,
    });

    if (!address) {
      throw new Error('Failed to generate Bitcoin address');
    }

    return {
      address,
      privateKey: Buffer.from(child.privateKey).toString('hex'),
      publicKey: Buffer.from(child.publicKey).toString('hex'),
      network: 'bitcoin',
      balance: '0',
    };
  }

  /**
   * Create multi-chain wallet with all supported networks
   */
  static createMultiChainWallet(mnemonic?: string): MultiChainWallet {
    const mnemonicPhrase = mnemonic || this.generateMnemonic();

    if (!this.validateMnemonic(mnemonicPhrase)) {
      throw new Error('Invalid mnemonic phrase');
    }

    return {
      mnemonic: mnemonicPhrase,
      accounts: {
        ethereum: this.createEVMWallet(mnemonicPhrase, 'ethereum'),
        polygon: this.createEVMWallet(mnemonicPhrase, 'polygon'),
        binance: this.createEVMWallet(mnemonicPhrase, 'binance'),
        base: this.createEVMWallet(mnemonicPhrase, 'base'),
        solana: this.createSolanaWallet(mnemonicPhrase),
        bitcoin: this.createBitcoinWallet(mnemonicPhrase),
      },
      createdAt: Date.now(),
    };
  }

  /**
   * Import wallet from mnemonic
   */
  static importWallet(mnemonic: string): MultiChainWallet {
    if (!this.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }
    return this.createMultiChainWallet(mnemonic);
  }

  /**
   * Import wallet from private key (EVM only)
   */
  static importFromPrivateKey(
    privateKey: string,
    network: 'ethereum' | 'polygon' | 'binance' | 'base'
  ): WalletAccount {
    const wallet = new Wallet(privateKey);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.signingKey.publicKey,
      network,
      balance: '0',
    };
  }

  /**
   * Import Solana wallet from private key
   * Accepts Base58 (Phantom format), hex 128 chars, or hex 64 chars
   */
  static importSolanaFromPrivateKey(privateKey: string): WalletAccount {
    try {
      let secretKey: Uint8Array;

      // Remove any whitespace
      privateKey = privateKey.trim();

      // Try to parse as hex (128 characters = 64 bytes)
      if (/^[0-9a-fA-F]{128}$/.test(privateKey)) {
        // Convert hex to Uint8Array
        const bytes = [];
        for (let i = 0; i < privateKey.length; i += 2) {
          bytes.push(parseInt(privateKey.substring(i, i + 2), 16));
        }
        secretKey = new Uint8Array(bytes);
      }
      // Try to parse as hex (64 characters = 32 bytes seed)
      else if (/^[0-9a-fA-F]{64}$/.test(privateKey)) {
        // 32 bytes hex - need to derive the full keypair
        const bytes = [];
        for (let i = 0; i < privateKey.length; i += 2) {
          bytes.push(parseInt(privateKey.substring(i, i + 2), 16));
        }
        const seed = new Uint8Array(bytes);
        const keypair = Keypair.fromSeed(seed);
        secretKey = keypair.secretKey;
      }
      // Try Base58 decode (Phantom wallet format - typically 87-88 characters)
      else {
        try {
          secretKey = bs58.decode(privateKey);

          // Validate length (should be 64 bytes for Solana secret key)
          if (secretKey.length !== 64) {
            throw new Error(`Invalid key length: ${secretKey.length} bytes. Expected 64 bytes.`);
          }
        } catch (decodeError: any) {
          throw new Error('Invalid format. Please use Base58 (from Phantom), 64-char hex (seed), or 128-char hex (secret key).');
        }
      }

      const keypair = Keypair.fromSecretKey(secretKey);

      return {
        address: keypair.publicKey.toString(),
        privateKey: Buffer.from(keypair.secretKey).toString('hex'),
        publicKey: keypair.publicKey.toString(),
        network: 'solana',
        balance: '0',
      };
    } catch (error: any) {
      throw new Error(`Invalid Solana private key: ${error.message}`);
    }
  }

  /**
   * Import Bitcoin wallet from private key (WIF or hex format)
   */
  static importBitcoinFromPrivateKey(privateKey: string): WalletAccount {
    try {
      let keyPair;
      privateKey = privateKey.trim();

      // Try WIF format first (starts with 5, K, or L for mainnet)
      if (/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/.test(privateKey)) {
        keyPair = ECPair.fromWIF(privateKey, bitcoin.networks.bitcoin);
      }
      // Try hex format (64 characters)
      else if (/^[0-9a-fA-F]{64}$/.test(privateKey)) {
        const buffer = Buffer.from(privateKey, 'hex');
        keyPair = ECPair.fromPrivateKey(buffer, { network: bitcoin.networks.bitcoin });
      }
      else {
        throw new Error('Invalid format. Use WIF (starts with 5/K/L) or 64-character hex.');
      }

      if (!keyPair.privateKey) {
        throw new Error('Failed to derive private key');
      }

      const { address } = bitcoin.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: bitcoin.networks.bitcoin,
      });

      if (!address) {
        throw new Error('Failed to generate Bitcoin address');
      }

      return {
        address,
        privateKey: Buffer.from(keyPair.privateKey).toString('hex'),
        publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
        network: 'bitcoin',
        balance: '0',
      };
    } catch (error: any) {
      throw new Error(`Invalid Bitcoin private key: ${error.message}`);
    }
  }
}
