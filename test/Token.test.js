const { result, before } = require('lodash')

require('chai')
    .use(require('chai-as-promised'))
    .should()

const Token = artifacts.require('./Token')

contract('Token', (accounts)=> {
    const name = 'My Name'
    const symbol = 'andy'
    const decimals = '18'
    const totalSupply = '6000000000000000000000000'

    let token
    beforeEach( async () => {
        token = await Token.new()
    })

    describe('deployment', () => {
        it('tracks the name', async () => {
            const result = await token.name()
            result.should.equal(name)

            // Fetch token from blockchain
            // Read token name here...
            // Check the token name is 'My Name'
        })
        it('tracks the symbol', async () => {
            const result = await token.symbol()
            result.should.equal(symbol)
        })
        it('tracks the decimals', async () => {
            const result = await token.decimals()
            result.toString().should.equal(decimals)
        })
        it('tracks the total supply', async () => {
            const result = await token.totalSupply()
            result.toString().should.equal(totalSupply)
        })
    })
})
