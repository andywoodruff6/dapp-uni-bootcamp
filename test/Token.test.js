import { tokens, EVM_REVERT}   from './helpers'

// const { result, before } = require('lodash')
// Auto generated to allow use of these words.

require('chai')
    .use(require('chai-as-promised'))
    .should()
// sets up chai for our testing needs
// it is vital to convert toString when using chai

const Token = artifacts.require('./Token')

contract('Token', ([deployer, receiver, exchange]) => {
    const name        = 'Polar Bear Swap'
    const symbol      = 'PBS'
    const decimals    = '18'
    const totalSupply = tokens(6000000).toString()
    // contract sets up our Token and defines the core properties

    let token
    beforeEach( async () => {
        token = await Token.new()
    }) // by calling async await here, we do not need to write these two lines for every "it" test

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
            result.toString().should.equal(totalSupply.toString())
        })
        
        it('assigns the total supply to the depoloyer', async () => {
            const result = await token.balanceOf(deployer)
            result.toString().should.equal(totalSupply.toString())
        }) 
    })

    describe('sending tokens', () => {
        let amount
        let result

        describe('success', async () => {

            beforeEach( async () => {
                amount = tokens(100)
                result = await token.transfer(receiver, amount, {from: deployer})
            })

            it('transfers token balances', async () =>{
                let balanceOf
                /* Checking balance before transfer
                * balanceOf = await token.balanceOf(deployer)
                * console.log("deployer balance before transfer", balanceOf.toString())
                * balanceOf = await token.balanceOf(receiver)
                * console.log('receiver balance before transfer:', balanceOf.toString())
                */    

                // Checking balance after transfer
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.equal(tokens(5999900).toString())
                // console.log("deployer balance after transfer", balanceOf.toString())
                balanceOf = await token.balanceOf(receiver)
                balanceOf.toString().should.equal(amount.toString())
                // console.log('receiver balance after transfer:', balanceOf.toString())
            })

            it('emits a Transfer event', async () =>{
                const log = result.logs[0]
                log.event.should.equal('Transfer')

                const event = log.args
                event.from.toString().should.equal(deployer, 'from is correct')
                event.to.toString().should.equal(receiver, 'to is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')
            })

        })

        describe('failure', async () => {

            it('rejects insuffecient balances', async () =>{
                let invalidAmount
                // Transfer to many tokens
                invalidAmount = tokens(100000000) // 100 Million is greater than the total supply
                await token.transfer(receiver, invalidAmount, {from: deployer}).should.be.rejectedWith(EVM_REVERT)
                // Attempt to transfer when no tokens owned
                invalidAmount = tokens(10)
                await token.transfer(deployer, invalidAmount, {from: receiver}).should.be.rejectedWith(EVM_REVERT)
            })
            it('rejects invalid receipients', async () => {
                await token.transfer(0x0, amount, {from: deployer}).should.be.rejected
            })
        })

    })

    describe('approving tokens', () =>{
        let result
        let amount
        
        beforeEach( async () => {
            amount = tokens(100)
            result = await token.approve(exchange, amount, {from: deployer})
        })

        describe('success', async () =>{
            it('allocates an allowance for delegated token spending on exchange', async () =>{
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal(amount.toString())
            }) 
            it('emits an Approval event', async () =>{
                const log = result.logs[0]
                log.event.should.equal('Approval')

                const event = log.args
                event.owner.toString().should.equal(deployer, 'fowner is correct')
                event.spender.toString().should.equal(exchange, 'spender is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')
            })
        })

        describe('failure', async () =>{
            it('rejects invalid receipients', async () => {
                await token.transfer(0x0, amount, {from: deployer}).should.be.rejected
            })
        })
    })

    describe('describe delegated token transfers', () => {
        let amount
        let result

        beforeEach(async () => {
            amount = tokens(100)
            await token.approve(exchange, amount, {from: deployer})
        })

        describe('success', async () => {

            beforeEach(async () => {
                result = await token.transferFrom(deployer, receiver, amount, {from: exchange})
            })

            it('transfers token balances', async () =>{
                let balanceOf
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.equal(tokens(5999900).toString())
                balanceOf = await token.balanceOf(receiver)
                balanceOf.toString().should.equal(amount.toString())
            })
            it('resets the allowance', async () =>{
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal('0')
            })
            it('emits a Transfer event', async () =>{
                const log = result.logs[0]
                log.event.should.equal('Transfer')

                const event = log.args
                event.from.toString().should.equal(deployer, 'from is correct')
                event.to.toString().should.equal(receiver, 'to is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')
            })

        })

        describe('failure', async () => {

            it('rejects insuffecient allowance', async () =>{
                const invalidAmount = tokens(100000000) 
                await token.transferFrom(deployer, receiver, invalidAmount, {from: exchange}).should.be.rejectedWith(EVM_REVERT)
                
                // invalidAmount = tokens(10)
                // await token.transfer(deployer, invalidAmount, {from: receiver}).should.be.rejectedWith(EVM_REVERT)
            })
            it('rejects invalid receipients', async () => {
                await token.transfer(deployer, 0x0, amount, {from: exchange}).should.be.rejected
            })
            // it('allocates an allowance for delegated token spending on exchange', async () =>{
            //     const allowance = await token.allowance(deployer, exchange)
            //     allowance.toString().should.equal(amount.toString())
            // })
        })
    })
})