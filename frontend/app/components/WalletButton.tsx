'use client';

import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import "@demox-labs/aleo-wallet-adapter-reactui/dist/styles.css";
import styles from "../page.module.css";

export default function WalletButton() {
  return (
    <div className={styles.walletButtonWrapper}>
      <WalletMultiButton className="wallet-button" />
    </div>
  );
} 