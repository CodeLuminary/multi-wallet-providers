import { WalletAdapterNetwork, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@solana/wallet-adapter-react-ui/lib/types/Button';
import { ethers } from "ethers";

import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

import '../src/css/bootstrap.css'
import {
    GlowWalletAdapter,
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,

} from '@solana/wallet-adapter-wallets';
//import fs from "fs";

import { clusterApiUrl, Transaction, SystemProgram, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo, useCallback, useState } from 'react';

import { actions, utils, programs, NodeWallet, Connection} from '@metaplex/js'; 


require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');
let thelamports = 0;
let theWallet = "9m5kFDqgpf7Ckzbox91RYcADqcmvxW4MmuNvroD5H2r9"

function getWallet(){

    
}
const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};


export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Mainnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new LedgerWalletAdapter(),
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolletExtensionWalletAdapter(), 
            new SolletWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    let [lamports, setLamports] = useState(.1);
    let [wallet, setWallet] = useState("9m5kFDqgpf7Ckzbox91RYcADqcmvxW4MmuNvroD5H2r9"); 
    const [shouldshow, setShouldShow] = useState(false);
    const [trustConnection, setTrustConnection] = useState({});
    const [etherAccount, setEtherAccount] = useState('');
    
    //Initialize wallet number
    //1 for metamask, 2 for sollet, 3 for Trust
    const [walletNumber, setWalletNumber] = useState(1);

    // const { connection } = useConnection();
    const connection = new Connection(clusterApiUrl("devnet"))
    const { publicKey, sendTransaction } = useWallet();

    const connector2 = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: QRCodeModal,
    });

    const sendToSolWallet = useCallback( async () => {

        if (!publicKey) throw new WalletNotConnectedError();
        connection.getBalance(publicKey).then((bal) => {
            console.log(bal/LAMPORTS_PER_SOL);
            //Get wallet balance
        });

        let lamportsI = LAMPORTS_PER_SOL*lamports;
        console.log(publicKey.toBase58());
        console.log("lamports sending: {}", thelamports)
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(theWallet),
                lamports: lamportsI,
            })
        );

        const signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction(signature, 'processed');
    }, [publicKey, sendTransaction, connection]);
    
    function setTheLamports(e: any)
    {
        console.log(Number(e.target.value));
        setLamports(Number(e.target.value));
        lamports = e.target.value;
        thelamports = lamports;
    }

    const connectMetamask = async () => {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        setEtherAccount(accounts[0]);
        console.log(typeof accounts[0])
        // Get provider from Metamask
       const provider = new ethers.providers.Web3Provider((window as any).ethereum)
        // Set signer
        const signer = provider.getSigner();

        //Get wallet balance
        const balance = await provider.getBalance(accounts[0].toString());
        console.log(ethers.utils.formatEther(balance));

        (window as any).ethereum.on('chainChanged', (chainId: any) => {
          window.location.reload();
        })

        (window as any).ethereum.on('accountsChanged', async function (accounts: []) {
          //setAccount(accounts[0])
          await connectMetamask()
        })
        
        //loadContracts(signer)
    }

    const getEtherBalance = async()=>{
      const provider = new ethers.providers.Web3Provider((window as any).ethereum)
      // Set signer
      const signer = provider.getSigner();

      //Get wallet balance
      const balance = await provider.getBalance(etherAccount);
      console.log(ethers.utils.formatEther(balance));
      return ethers.utils.formatEther(balance);
    }

    const sendFromMetamask = async()=>{
      const provider = new ethers.providers.Web3Provider((window as any).ethereum)
      // Set signer
      const signer = provider.getSigner();

      //Send ether
      signer.sendTransaction({
          to: '', //Owner's address
          value: ''
      });
    }

    const connectTrust = async () =>{
      // Create a connector

      //console.log(connector2, 'connector')
      //console.log(connector2.accounts[0], 'meta');
      
      // Check if connection is already established
      if (!connector2.connected) {
        // create new session
        connector2.createSession();
        
      }
      else{
        connector2.killSession();
        connector2.createSession();
        //console.log(connector2.clientMeta);
      }

      // Subscribe to connection events
      connector2.on("connect", (error, payload) => {
        if (error) {
          console.log(error)
          throw error;
        }
        console.log(payload, 'Connection Payload');

        // Get provided accounts and chainId
        const { accounts, chainId } = payload.params[0];
      });

      connector2.on("session_update", (error, payload) => {
        if (error) {
          throw error;
        }
        console.log(payload, 'Session update Payload')
        // Get updated accounts and chainId
        const { accounts, chainId } = payload.params[0];
      });

      connector2.on("disconnect", (error, payload) => {
        if (error) {
          throw error;
        }
        // Delete connector
      });
    }

    const getTrustWalletBalance = ()=>{

    }
  
  const sendFromTrustWallet=(amount: any)=>{
    const tx = {
      from: connector2.accounts[0],//"0xbc28Ea04101F03aA7a94C1379bc3AB32E65e62d3", // Required
      to: "0x89D24A7b4cCB1b6fAA2625Fe562bDd9A23260359", // Put owner's ether address here
      data: "0x", // Required
      //gasPrice: "0x02540be400", // Optional
      //gas: "0x9c40", // Optional
      value: (amount * 10^18).toString(), // Optional
      nonce: "0x0114", // Optional
    };
    
    // Send transaction
    connector2.sendTransaction(tx)
      .then((result) => {
        // Returns transaction id (hash)
        console.log(result);
      })
      .catch((error) => {
        // Error returned when rejected
        console.error(error);
      });
    
  }

  function setTheWallet(e: any){
    setWallet(e.target.value)
    theWallet = e.target.value;
}

/*
    const transactWithTrust = async()=>{
      const network = 118; // Atom (SLIP-44)
        const account = accounts.find((account) => account.network === network);
        // Transaction structure based on Trust's protobuf messages.
        const tx = {
        accountNumber: "1035",
          chainId: "cosmoshub-2",
          fee: {
            amounts: [
              {
                denom: "uatom",
                amount: "5000"
              }
            ],
            gas: "200000"
          },
          sequence: "40",
          sendCoinsMessage: {
            fromAddress: account.address,
            toAddress: "cosmos1zcax8gmr0ayhw2lvg6wadfytgdhen25wrxunxa",
            amounts: [
              {
                denom: "uatom",
                amount: "100000"
              }
            ]
          }
      };

        const request = connector._formatRequest({
            method: 'trust_signTransaction',
            params: [
                {
                    network,
                    transaction: JSON.stringify(tx),
                },
            ],
        });

        connector._sendCallRequest(request)
        .then(result => {
          // Returns transaction signed in json or encoded format
          console.log(result);
        })
        .catch(error => {
          // Error returned when rejected
          console.error(error);
        });
    }*/

    const connectBnb = ()=>{
        const api = "https://testnet-dex.binance.org";
        //const client = new BncClient(api);
        /*client.initChain();

        client.getBalance('address');
        client.transfer('fromAddress', 'toAddress', 'amount','assest');
    */

        (window as any).binanceChain.request({method: 'bsc_accounts'})
    }
    return (
      <div className="App">
        <div style={{display: shouldshow ? `flex`: `none`}} className="mymodal">
          <div>
            <span className="cancel" onClick={()=>setShouldShow(false)}>X</span>
              <button onClick={()=>{
                setWalletNumber(1);
                connectMetamask();
              }}>Metamask</button><br/><br/>
              <button onClick={()=>connectTrust()}>Trust</button><br/><br/>
              <WalletMultiButton >
                <button onClick={()=>setWalletNumber(2)}>Sollet</button>
              </WalletMultiButton><br/> 
              
          </div>
        </div>
          <div className="navbar">
            <div className="navbar-inner ">
              <a id="title" className="brand" href="#">Multi-Wallet</a>
              <ul className="nav">


              </ul>
              <ul className="nav pull-right">
                <li><button className="btn" onClick={()=>setShouldShow(true)}>Select Wallet</button></li>
              </ul>
            </div>
          </div>
        <input value={lamports} type="number" onChange={(e) => setTheLamports(e)}></input>
        <br></br>
        <button className='btn' onClick={sendToSolWallet}>Send Crypto </button>
        <button onClick={connectTrust}>Connect Trust</button>
      </div>
    );
};