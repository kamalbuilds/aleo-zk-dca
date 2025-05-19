'use client';

import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { DecryptPermission, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";
import { useMemo } from "react";
import { 
  PuzzleWalletAdapter, 
  LeoWalletAdapter, 
  FoxWalletAdapter,
  SoterWalletAdapter 
} from 'aleo-adapters';

// The name of our deployed DCA program
const DCA_PROGRAM_ID = "zk_dca_arcane_finance.aleo";

export default function WalletProviders({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: 'ZK-DCA',
      }),
      new PuzzleWalletAdapter({
        programIdPermissions: {
          [WalletAdapterNetwork.TestnetBeta]: [DCA_PROGRAM_ID]
        },
        appName: 'ZK-DCA',
        appDescription: 'A privacy-preserving Dollar-Cost Averaging protocol on Aleo',
        appIconUrl: '/aleo.svg'
      }),
      new FoxWalletAdapter({
        appName: 'ZK-DCA',
      }),
      new SoterWalletAdapter({
        appName: 'ZK-DCA',
      })
    ],
    []
  );

  return (
    <WalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.TestnetBeta}
      autoConnect
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  );
} 