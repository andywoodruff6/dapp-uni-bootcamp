export const tokens = (n) => {
    return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
    )
} // tokens will take a number and add 10^18 to the value. 
  // web3 needs to be called as lowercase. Then .BN not .isBN

export const EVM_REVERT = 'VM Exception while processing transaction: revert'
