import {
  web3Loaded,
  web3AccountLoaded,
  tokenLoaded,
  exchangeLoaded,
  cancelledOrdersLoaded,
  filledOrdersLoaded,
  allOrdersLoaded
} from './actions'
import Web3     from 'web3'
import Token    from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'

// Loading web3 and using dispatch to dispatch an action. This is the only way to trigger an action
// An if / else statement allows the website to halt if a critical piece is missing
// In this case we check if metamask is installed via web3
export const loadWeb3 = async (dispatch) => {
  if(typeof window.ethereum!=='undefined'){
    const web3 = new Web3(window.ethereum)
    dispatch(web3Loaded(web3))
    return web3
  } else {
    window.alert('Please install MetaMask')
    window.location.assign("https://metamask.io/")
  }
}

// Pulling in the account that is being used in Metamask
// 1) Ask for the list of accounts in Metamask
// 2) Then select the first account
// 3) If no account then ask the user to log in
export const loadAccount = async (web3, dispatch) => {
  const accounts = await web3.eth.getAccounts()
  const account = await accounts[0]
  if(typeof account !== 'undefined'){
    dispatch(web3AccountLoaded(account))
    return account
  } else {
    window.alert('Please login with MetaMask')
    return null
  }
}

// Pulling in the token contract from the blockchain
// 1) This checks the token contract and our network
export const loadToken = async (web3, networkId, dispatch) => {
  try {
    const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
    dispatch(tokenLoaded(token))
    return token
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}
// Pulling in the exchange contract from the blockchain
// 1) This checks the token contract and our network
export const loadExchange = async (web3, networkId, dispatch) => {
  try {
    const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
    dispatch(exchangeLoaded(exchange))
    return exchange
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}

// Here we load check the blockchain for events that our contracts publish
// 1) We need to export const then take in our exchange where the events are coming from
// 2) Then we getPastEvents, calling the event name and giving a range of blocks to look at
// 2a) Might be faster to start just before launch to ignore impossible solutions
// 3) We write this code for all events that we want to listen to
// So far, we have Cancel, Trade and Order
export const loadAllOrders = async (exchange, dispatch) => {
  const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest'})
  const cancelledOrders = cancelStream.map((event)=> event.returnValues)
  dispatch(cancelledOrdersLoaded(cancelledOrders))
 
  const tradeStream = await exchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest'})
  const filledOrders = tradeStream.map((event) => event.returnValues)
  dispatch(filledOrdersLoaded(filledOrders))

  const orderStream = await exchange.getPastEvents('Order', { fromBlock: 0, toBlock: 'latest'})
  const allOrders = orderStream.map((event) => event.returnValues)
  dispatch(allOrdersLoaded(allOrders))
}