import { iteratee } from 'lodash'
import { tokens, ether, EVM_REVERT, ETHER_ADDRESS}   from './helpers'

const Token    = artifacts.require('./Token')
const Exchange = artifacts.require('./Exchange')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
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

    describe('deployment', () => {
       it('tracks the feeAccount', async () => {
           const result = await exchange.feeAccount()
           result.should.equal(feeAccount)
       })
       it('tracks the feePercent', async () => {
        const result = await exchange.feePercent()
        result.toString().should.equal(feePercent.toString())
    })
    })
// DEPOSITS
// --------------------------------------------------------------------- 
    describe('depositing tokens', () => {
        let result
        let amount

        describe('success', () => {

            beforeEach( async () => {
                amount = tokens(10)
                await token.approve(exchange.address, amount, {from: user1})
                result = await exchange.depositToken(token.address, amount, {from: user1})
            })
            it('tracks the token deposit', async () => {
                let balance
                balance = await token.balanceOf(exchange.address)
                balance.toString().should.equal(amount.toString())
                // check tokens on exchange
                balance = await exchange.tokens(token.address, user1)
                balance.toString().should.equal(amount.toString())
            })
            it('emits a Deposit event', async () =>{
                const log = result.logs[0]
                log.event.should.equal('Deposit')

                const event = log.args
                event.token.toString().should.equal(token.address, 'token is correct')
                event.user.toString().should.equal(user1, 'user is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal(amount.toString(), 'balance is correct')
            })
        })
        describe('failure', () => {
            it('rejects Ether deposits', async () => {
                // missing info
            })

            it('fails when no tokens are approved', async () => {
                // no tokens approved to spend
                await exchange.depositToken(token.address, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
            })

            it('rejects Ether deposits', async () => {
                await exchange.depositToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })
    describe('depositing Ether', () => {
        let result
        let amount

        beforeEach( async () => {
            amount = ether(1)
            result = await exchange.depositEther({from: user1, value: amount })
        })
        it('tracks the Ether deposit', async () => {
            let balance
            balance = await exchange.tokens(ETHER_ADDRESS, user1)
            balance.toString().should.equal(amount.toString())
        })
        it('emits a Deposit event', async () =>{
            const log = result.logs[0]
            log.event.should.equal('Deposit')

            const event = log.args
            event.token.toString().should.equal(ETHER_ADDRESS, 'Ether is correct')
            event.user.toString().should.equal(user1, 'user is correct')
            event.amount.toString().should.equal(amount.toString(), 'amount is correct')
            event.balance.toString().should.equal(amount.toString(), 'balance is correct')
        })
    })
    describe('fallback', async () => {
         it('reverts when Ether is sent', async () =>{
            await exchange.sendTransaction({value:1, from: user1}).should.be.rejectedWith(EVM_REVERT)
         })
    })
// WITHDRAWS
// ---------------------------------------------------------------------
    describe('withdrawing Ether', async () => {
        let result
        let amount

        beforeEach(async () => {
            amount = ether(1)
            await exchange.depositEther({from: user1, value: amount})
        }) // deposits 1 eth
        describe('success', async () => {
            beforeEach(async () => {
                result = await exchange.withdrawEther(ether(1), {from: user1})
            }) // calls the withdraw function
            it('withdraws Ether funds', async () => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1)
                balance.toString().should.equal('0')
            }) // checks that the balance of eth for user1 is 0
            it('emits a Withdraw event', async () =>{
                const log = result.logs[0]
                log.event.should.equal('Withdraw')

                const event = log.args
                event.token.toString().should.equal(ETHER_ADDRESS)
                event.user.toString().should.equal(user1)
                event.amount.toString().should.equal(amount.toString())
                event.balance.toString().should.equal('0')
            })
        })
        describe('failure', async () => {
            it('rejects withdraws for insufficient balances', async () => {
                await exchange.withdrawEther(ether(100), {from: user1}).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })
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
// ORDERS
// ----------------------------------------------------------------------
    describe('making orders', async () => {
        let result

        beforeEach(async () => {
            result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1})
        })
        it('tracks the newly created order', async () => {
            const orderCount = await exchange.orderCount()
            orderCount.toString().should.equal('1')
            const order = await exchange.orders('1')

            order.id.toString().should.equal('1')
            order.user.should.equal(user1)
            order.tokenGet.should.equal(token.address)
            order.amountGet.toString().should.equal(tokens(1).toString())
            order.tokenGive.should.equal(ETHER_ADDRESS)
            order.amountGive.toString().should.equal(ether(1).toString())
            order.timestamp.toString().length.should.be.at.least(1)
        })
        it('emits an order event', async () => {
            const log = result.logs[0]
            log.event.should.equal('Order')
            const event = log.args

            event.id.toString().should.equal('1')
            event.user.should.equal(user1)
            event.tokenGet.should.equal(token.address)
            event.amountGet.toString().should.equal(tokens(1).toString())
            event.tokenGive.should.equal(ETHER_ADDRESS)
            event.amountGive.toString().should.equal(ether(1).toString())
            event.timestamp.toString().length.should.be.at.least(1)           
        })
    })

    describe('order actions', async () => {
        beforeEach(async () => {
            //user1 deposits eth
            await exchange.depositEther({from: user1, value: ether(1)})
            // give tokens to user2
            await token.transfer(user2, tokens(100), {from: deployer})
            // user2 deposits tokens only
            await token.approve(exchange.address, tokens(2), {from: user2})
            await exchange.depositToken(token.address, tokens(2), {from: user2})
            // user1 makes an order to buy tokens with Eth
            await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1})
        })
        describe('filling orders', async () => {
            describe('success', async () => {
                let result 
                beforeEach(async () => {
                    // user2 fills order
                    result = await exchange.fillOrder('1', {from: user2})
                })
                it('executes the trade and charges fees', async () => {
                    let balance
                    balance = await exchange.balanceOf(token.address, user1)
                    balance.toString().should.equal(tokens(1).toString(), 'user1 recieved tokens')

                    balance = await exchange.balanceOf(ETHER_ADDRESS, user2)
                    balance.toString().should.equal(ether(1).toString(), 'user2 recieved ether')

                    balance = await exchange.balanceOf(ETHER_ADDRESS, user1)
                    balance.toString().should.equal('0', 'user1 ether deducted')

                    balance = await exchange.balanceOf(token.address, user2)
                    balance.toString().should.equal(tokens(0.99).toString(), 'user2 tokens deducted with fee applied')

                    const feeAccount = await exchange.feeAccount()
                    balance = await exchange.balanceOf(token.address, feeAccount)
                    balance.toString().should.equal(tokens(0.01).toString(), 'feeAccount recieved fee')
                })
                it('updates filled orders', async () => {
                    const orderFilled = await exchange.orderFilled(1)
                    orderFilled.should.equal(true)
                })
                it('emits an Trade event', async () => {
                    const log = result.logs[0]
                    log.event.should.equal('Trade')
                    const event = log.args
                
                    event.id.toString().should.equal('1')
                    event.user.should.equal(user1)
                    event.tokenGet.should.equal(token.address)
                    event.amountGet.toString().should.equal(tokens(1).toString())
                    event.tokenGive.should.equal(ETHER_ADDRESS)
                    event.amountGive.toString().should.equal(ether(1).toString())
                    event.timestamp.toString().length.should.be.at.least(1)           
                })
            })
            describe('failure', async () => {

                it('rejects invalid order ids', async () => {
                    const invalidOrderId = 9999
                    await exchange.fillOrder(invalidOrderId, {from: user2}).should.be.rejectedWith(EVM_REVERT)
                })
                it('rejects already filled orders', async () =>{
                    //fill the order
                    await exchange.fillOrder('1', {from: user2}).should.be.fulfilled
                    //Try to fill again
                    await exchange.fillOrder('1', {from: user2}).should.be.rejectedWith(EVM_REVERT)
                })
                it('rejects cancelled orders', async () => {
                    // Cancel the order
                    await exchange.cancelOrder('1', {from: user1}).should.be.fulfilled
                    // try to fill canceled order
                    await exchange.fillOrder('1', {from: user2}).should.be.rejectedWith(EVM_REVERT)
                })
            })
        })
        
        describe('cancelling orders', async () => {
            let result

            describe('success', async () => {
                beforeEach(async () =>{
                    result = await exchange.cancelOrder('1', {from: user1})
                })
                it('updates cancelled orders', async () => {
                    const orderCancelled = await exchange.orderCancelled(1)
                    orderCancelled.should.equal(true)
                })
                it('emits a cancel event', async () => {
                    const log = result.logs[0]
                    log.event.should.equal('Cancel')
                    const event = log.args
        
                    event.id.toString().should.equal('1')
                    event.user.should.equal(user1)
                    event.tokenGet.should.equal(token.address)
                    event.amountGet.toString().should.equal(tokens(1).toString())
                    event.tokenGive.should.equal(ETHER_ADDRESS)
                    event.amountGive.toString().should.equal(ether(1).toString())
                    event.timestamp.toString().length.should.be.at.least(1)           
                })
            })
            describe('failure', async () => {
                it('rejects invalid order ids', async() => {
                    const invalidOrderId = 9999999
                    await exchange.cancelOrder(invalidOrderId, {from: user1}).should.be.rejectedWith(EVM_REVERT)
                })
                it('rejects unathorized cancelations', async () => {
                    //Try to cancel the order from another user
                    await exchange.cancelOrder('1', {from: user2}).should.be.rejectedWith(EVM_REVERT)
                })
            })
        })
    })
})