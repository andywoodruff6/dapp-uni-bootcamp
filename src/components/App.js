import './App.css';
import React, { Component }        from 'react';
import { connect }                 from 'react-redux';
import Navbar                      from './navbar';
import Content                     from './content';
import { contractsLoadedSelector } from '../store/selectors';
import { 
  loadWeb3, 
  loadAccount, 
  loadToken,
  loadExchange
} from '../store/interactions'

class App extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    const web3      = await loadWeb3(dispatch)
    const networkId = await web3.eth.net.getId()
    const token     = await loadToken(web3, networkId, dispatch)
    await loadAccount(web3, dispatch)
    const exchange  = await loadExchange(web3, networkId, dispatch)
    if(!token) {
      window.alert('Token smart contract not detected on current network. Select another network with Metamask')
      return
    }
    if(!exchange) {
      window.alert('Exchange contract not detected on current network. Select another network with Metamask')
      return
    }
  }

  render() {
    return (
      <div>
        <Navbar />
        { this.props.contractsLoaded ? <Content /> : <div className='content'></div> }
      </div>
    );
  }
}
// Passing the state to Props
function mapStateToProps(state) {
  return{
    contractsLoaded: contractsLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(App);