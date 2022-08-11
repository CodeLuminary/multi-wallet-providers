const {BncClient} = require('@binance-chain/javascript-sdk');
const api = "https://testnet-dex.binance.org"
const client = new BncClient(api);
import { ethers } from "ethers"

client.initChain();

client.getBalance('address');
client.transfer('fromAddress', 'toAddress', 'amount','assest', 'memo', 'sequence');

const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner();

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      await web3Handler()
    })
    
}

function App(){

}

export default App;