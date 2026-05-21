import { MultiChainWallet, Token, Transaction } from '@/types';

const STORAGE_KEYS = {
  WALLET: 'trust_wallet_data',
  TOKENS: 'trust_wallet_tokens',
  TRANSACTIONS: 'trust_wallet_transactions',
  SETTINGS: 'trust_wallet_settings',
} as const;

export class StorageService {
  /**
   * Save wallet to local storage
   * NOTE: In production, you should encrypt sensitive data
   */
  static saveWallet(wallet: MultiChainWallet): void {
    try {
      const encryptedData = JSON.stringify(wallet);
      localStorage.setItem(STORAGE_KEYS.WALLET, encryptedData);
    } catch (error) {
      console.error('Error saving wallet:', error);
      throw new Error('Failed to save wallet');
    }
  }

  /**
   * Get wallet from local storage
   */
  static getWallet(): MultiChainWallet | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WALLET);
      if (!data) return null;
      return JSON.parse(data) as MultiChainWallet;
    } catch (error) {
      console.error('Error loading wallet:', error);
      return null;
    }
  }

  /**
   * Check if wallet exists
   */
  static hasWallet(): boolean {
    return localStorage.getItem(STORAGE_KEYS.WALLET) !== null;
  }

  /**
   * Delete wallet from storage
   */
  static deleteWallet(): void {
    localStorage.removeItem(STORAGE_KEYS.WALLET);
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  }

  /**
   * Save custom tokens
   */
  static saveTokens(tokens: Token[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  /**
   * Get custom tokens
   */
  static getTokens(): Token[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOKENS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading tokens:', error);
      return [];
    }
  }

  /**
   * Add a custom token
   */
  static addToken(token: Token): void {
    const tokens = this.getTokens();
    const exists = tokens.some(
      (t) => t.address.toLowerCase() === token.address.toLowerCase() && t.network === token.network
    );
    if (!exists) {
      tokens.push(token);
      this.saveTokens(tokens);
    }
  }

  /**
   * Save transaction history
   */
  static saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  /**
   * Get transaction history
   */
  static getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  /**
   * Add a transaction
   */
  static addTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    transactions.unshift(transaction);
    // Keep only last 100 transactions
    if (transactions.length > 100) {
      transactions.pop();
    }
    this.saveTransactions(transactions);
  }

  /**
   * Update transaction status
   */
  static updateTransactionStatus(
    hash: string,
    status: 'pending' | 'confirmed' | 'failed'
  ): void {
    const transactions = this.getTransactions();
    const tx = transactions.find((t) => t.hash === hash);
    if (tx) {
      tx.status = status;
      this.saveTransactions(transactions);
    }
  }
}
