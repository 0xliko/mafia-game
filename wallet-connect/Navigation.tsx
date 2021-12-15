import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import React, { FC,useMemo,useEffect } from 'react';


const Navigation: FC = () => {
    const { wallet,publicKey,disconnect} = useWallet();
    const { setVisible } = useWalletModal();
    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
    const connectWallet = ()=>{
         setVisible(true)
    }
    useEffect(()=>{

        if(base58) {
            console.log(base58,"this is connected wallet address");
            if(window.fetchNFTS)
                window.fetchNFTS({address:base58})
            disconnect();
        }
    },[base58])
    return (
        <>
            <label onClick={connectWallet}>Wallet Connect</label>
        </>
    );
};

export default Navigation;
