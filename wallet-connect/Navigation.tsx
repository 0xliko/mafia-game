import { useWallet } from '@solana/wallet-adapter-react';
import {useWalletModal, WalletDisconnectButton, WalletMultiButton} from '@solana/wallet-adapter-react-ui';

import React, {FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react';
export interface NavigationProps {
    modalActivated: (url:string)=>{}
}
const Navigation: FC<NavigationProps> = ({modalActivated}) => {
    const { publicKey, wallet, disconnect,connect,connecting,connected,ready } = useWallet();
    const { setVisible,visible } = useWalletModal();
    const [ parentUrl,setParentUrl ] = useState('');
    const [walletEvent, setWalletEvent] = useState(false);
    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
    // @ts-ignore // for development
    window.disconnect = disconnect;
    // @ts-ignore // for development
    window.connect = connect;

    useEffect(()=>{

        window.addEventListener('message',(e:MessageEvent)=>{
            const {type} = e.data;
            if(type=='openWalletModal'){
                modalActivated(e.data.curUrl);
                console.log("out event got__")
                setWalletEvent(true);
                setParentUrl(e.data.curUrl);
            }
        });

    },[]);

    useEffect(()=>{

        if(walletEvent==true){
            if(!wallet) {
                setVisible(true);
            }
            else{
                /// TODO
                console.log("Already wallet connected")
                if(connected){
                    if(parentUrl) {
                        window.parent.postMessage({type: 'walletConnected', address: base58,walletName:wallet?.name,walletIcon:wallet?.icon}, parentUrl);
                    }
                } else{
                    if(!connecting) connect();
                }
            }
            setWalletEvent(false);
        }
    },[walletEvent])


    useEffect(()=>{
         if(!visible && !connecting) {
             if(parentUrl!='') {
                 window.parent.postMessage({type: 'closeDialog',}, parentUrl);
             }
         }
    },[visible]);
    useEffect(()=>{
        if(connected){
            if(parentUrl) {
                window.parent.postMessage({type: 'walletConnected', address: base58,walletName:wallet?.name,walletIcon:wallet?.icon}, parentUrl);
            }
        } else{

            if(parentUrl) {
                console.log(publicKey,parentUrl,wallet,"disconnected & parentUrl ready")
                window.parent.postMessage({type: 'walletDisconnected', address: base58,walletName:wallet?.name,walletIcon:wallet?.icon}, parentUrl);
            }
        }

    },[connected,parentUrl])
    useEffect(()=>{
        if(wallet) {
            connect();
        }
    },[wallet])
    return (
        <nav>

            <div>
                <WalletMultiButton/>
                {wallet && <WalletDisconnectButton />}
            </div>
        </nav>
    );
};

export default Navigation;
