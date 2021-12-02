import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import {ConnectionProvider, useWallet, WalletProvider} from '@solana/wallet-adapter-react';
import { WalletModalProvider ,WalletModal} from '@solana/wallet-adapter-react-ui';
import {
    getLedgerWallet,
    getPhantomWallet,
    getSlopeWallet,
    getSolflareWallet,
    getSolletWallet,
    getSolletExtensionWallet,
    getTorusWallet,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navigation from './Navigation';
import Notification from './Notification';


const Wallet: FC = () => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const [ parentUrl,setParentUrl ] = useState('');
    const wallets = useMemo(
        () => [
            getPhantomWallet(),
            getSlopeWallet(),
            getSolflareWallet(),
            getTorusWallet({
                options: { clientId: 'Get a client ID @ https://developer.tor.us' },
            }),
            getLedgerWallet(),
            getSolletWallet({ network }),
            getSolletExtensionWallet({ network }),
        ],
        [network]
    );

    const onError = useCallback(
        (error: WalletError) =>{
           console.log(error.name,error.message,error.error);
           if(error.name == 'WalletConnectionError' && error.error.code == 4001) {
               if(parentUrl){
                   window.parent.postMessage({type: 'WalletConnectionErrorByUser'}, parentUrl);
               }
           } else if(error.name == 'WalletNotReadyError'){
               if(parentUrl){
                   window.parent.postMessage({type: 'WalletNotReadyError'}, parentUrl);
               }
           }
        },
        [parentUrl]
    );
    const modalActivated = (url:string)=>{
        setParentUrl(url);
    }
    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError}>
                <div className="connecting">
                    <div className="connecting-body">
                        <div className="connecting-icon"></div>
                        <label>Connecting ...</label>
                    </div>
                </div>
                <WalletModalProvider>
                    <Navigation modalActivated={modalActivated}/>
                </WalletModalProvider>
                <Toaster position="bottom-left" reverseOrder={false} />
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default Wallet;
