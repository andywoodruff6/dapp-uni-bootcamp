import { iteratee } from 'lodash'
import { tokens, ether, EVM_REVERT, ETHER_ADDRESS}   from './helpers'

const Token    = artifacts.require('./Token')
const Exchange = artifacts.require('./Exchange')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Exchange', ([deployer, feeAccount, user1]) => {
    let exchange
    let token
    const feePercent = 1

    beforeEach( async () => {
        // Deploy Tokens
        token    = await Token.new()
        // Transfer tokens to user1
        token.transfer(user1, tokens(100), {from: deployer})
        // Deploy Exchange
        exchange = await Exchange.new(feeAccount, feePercent)

    }) 

    // describe('deployment', () => {
    //    it('tracks the feeAccount', async () => {
    //        const result = await exchange.feeAccount()
    //        result.should.equal(feeAccount)
    //    })
    //    it('tracks the feePercent', async () => {
    //     const result = await exchange.feePercent()
    //     result.toString().should.equal(feePercent.toString())
    // })
    // })

    // describe('depositing tokens', () => {
    //     let result
    //     let amount

    //     describe('success', () => {

    //         beforeEach( async () => {
    //             amount = tokens(10)
    //             await token.approve(exchange.address, amount, {from: user1})
    //             result = await exchange.depositToken(token.address, amount, {from: user1})
    //         })
    //         it('tracks the token deposit', async () => {
    //             let balance
    //             balance = await token.balanceOf(exchange.address)
    //             balance.toString().should.equal(amount.toString())
    //             // check tokens on exchange
    //             balance = await exchange.tokens(token.address, user1)
    //             balance.toString().should.equal(amount.toString())
    //         })
    //         it('emits a Deposit event', async () =>{
    //             const log = result.logs[0]
    //             log.event.should.equal('Deposit')

    //             const event = log.args
    //             event.token.toString().should.equal(token.address, 'token is correct')
    //             event.user.toString().should.equal(user1, 'user is correct')
    //             event.amount.toString().should.equal(amount.toString(), 'amount is correct')
    //             event.balance.toString().should.equal(amount.toString(), 'balance is correct')
    //         })
    //     })
    //     describe('failure', () => {
    //         it('rejects Ether deposits', async () => {
    //             // missing info
    //         })

    //         it('fails when no tokens are approved', async () => {
    //             // no tokens approved to spend
    //             await exchange.depositToken(token.address, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
    //         })

    //         it('rejects Ether deposits', async () => {
    //             await exchange.depositToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
    //         })
    //     })
    // })
    // describe('depositing Ether', () => {
    //     let result
    //     let amount

    //     beforeEach( async () => {
    //         amount = ether(1)
    //         result = await exchange.depositEther({from: user1, value: amount })
    //     })
    //     it('tracks the Ether deposit', async () => {
    //         let balance
    //         balance = await exchange.tokens(ETHER_ADDRESS, user1)
    //         balance.toString().should.equal(amount.toString())
    //     })
    //     it('emits a Deposit event', async () =>{
    //         const log = result.logs[0]
    //         log.event.should.equal('Deposit')

    //         const event = log.args
    //         event.token.toString().should.equal(ETHER_ADDRESS, 'Ether is correct')
    //         event.user.toString().should.equal(user1, 'user is correct')
    //         event.amount.toString().should.equal(amount.toString(), 'amount is correct')
    //         event.balance.toString().should.equal(amount.toString(), 'balance is correct')
    //     })
    // })
    // describe('fallback', async () => {
    //      it('reverts when Ether is sent', async () =>{
    //         await exchange.sendTransaction({value:1, from: user1}).should.be.rejectedWith(EVM_REVERT)
    //      })
    // })
    // describe('withdrawing Ether', async () => {
    //     let result
    //     let amount

    //     beforeEach(async () => {
    //         amount = ether(1)
    //         await exchange.depositEther({from: user1, value: amount})
    //     }) // deposits 1 eth
    //     describe('success', async () => {
    //         beforeEach(async () => {
    //             result = await exchange.withdrawEther(ether(1), {from: user1})
    //         }) // calls the withdraw function
    //         it('withdraws Ether funds', async () => {
    //             const balance = await exchange.tokens(ETHER_ADDRESS, user1)
    //             balance.toString().should.equal('0')
    //         }) // checks that the balance of eth for user1 is 0
    //         it('emits a Withdraw event', async () =>{
    //             const log = result.logs[0]
    //             log.event.should.equal('Withdraw')

    //             const event = log.args
    //             event.token.toString().should.equal(ETHER_ADDRESS)
    //             event.user.toString().should.equal(user1)
    //             event.amount.toString().should.equal(amount.toString())
    //             event.balance.toString().should.equal('0')
    //         })
    //     })
    //     describe('failure', async () => {
    //         it('rejects withdraws for insufficient balances', async () => {
    //             await exchange.withdrawEther(ether(100), {from: user1}).should.be.rejectedWith(EVM_REVERT)
    //         })
    //     })
    // })
    describe('withdrawing Tokens', async () => {
        let result
        let amount

        describe('success', async () => {
            beforeEach(async () => {
                amount = tokens(10)
                await token.approve(exchange.address, amount, {from: user1})
                await exchange.depositToken(token.address, amount, {from: user1})
                 
                result = await exchange.withdrawToken(token.address, amount, {from: user1})
            })
            it('withdraws Token funds', async () => {
                const balance = await exchange.tokens(token.address, user1)
                balance.toString().should.equal('0')
            })
            it('emits a Withdraw event', async () =>{
                const log = result.logs[0]
                log.event.should.equal('Withdraw')

                const event = log.args
                event.token.toString().should.equal(token.address)
                event.user.toString().should.equal(user1)
                event.amount.toString().should.equal(amount.toString())
                event.balance.toString().should.equal('0')
            })
        })
        describe('failure', async () => {
            it('rejects Ether withdraws', async () => {
                await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
            })
            it('rejects withdraws for insufficient balances', async () => {
                await exchange.withdrawToken(token.address, tokens(1000), {from: user1}).should.be.rejectedWith(EVM_REVERT)
            })
        })
    }) 
    describe('checking balances', async () => {
        beforeEach(async () => {
            await exchange.depositEther({from: user1, value: ether(1)})
        })
        it('returns user balance', async () => {
            const result = await exchange.balanceOf(ETHER_ADDRESS, user1)
            result.toString().should.equal(ether(1).toString())
        })
    })
})