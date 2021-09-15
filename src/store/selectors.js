import { get }            from 'lodash'
import moment             from 'moment'
import { createSelector } from "reselect"
import { ETHER_ADDRESS, 
         token, 
         ether,
         GREEN,
         RED }          from '../helpers'

const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)
// const account = state => state.web3.account
// export const accountSelector = createSelector(account, a => a)
// ^ this is a routine pattern when we want to fetch items from the state 

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchange = state => get(state, 'exchange.contract')
export const exchangeSelector = createSelector(exchange, e => e)


export const contractsLoadedSelector = createSelector(
    tokenLoaded,
    exchangeLoaded,
    (tl, el) => (tl && el)
)
const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const filledOdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

const filledOrders = state => get(state, 'exchange.filledOrders.data', [])
export const filledOdersSelector = createSelector(
    filledOrders,
    (orders) => {
        // sorting orders by timestamp for decorating
        orders = orders.sort((a,b) => a.timestamp - b.timestamp)
        // decorate the orders
        orders = decorateFilledOrders(orders)
        // sorting orders by timestamp for display
        orders = orders.sort((a,b) => b.timestamp - a.timestamp)
        return orders
    } )

const decorateFilledOrders = (orders) => {
    //Track previous order history
    let previousOrder = orders[0]
    return(
        orders.map((order) =>{
            order = decorateOrder(order)
            order = decorateFilledOrder(order, previousOrder)
            previousOrder = order // update previous order once it is decorated
            return order
        })
    )
}
const decorateFilledOrder = (order, previousOrder) => {
    return({
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
    })
}
const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    //show green if new order price is greater than previous
    //show red if new order price is greater than previous
    if(previousOrder.id === orderId) { 
        return GREEN
    } // ideal for a one line turner operator or w.e. its called
    if(previousOrder.tokenPrice <= tokenPrice) {
        return GREEN
    } else {
        return RED
    }
}



const decorateOrder = (order) => {
    let etherAmount
    let tokenAmount

    if(order.tokenGive === ETHER_ADDRESS) {
        etherAmount = order.amountGive
        tokenAmount = order.amountGet
    } else {
        tokenAmount = order.amountGive
        etherAmount = order.amountGet
    }
    // Calculate token price
    const precision = 100000
    let tokenPrice = (etherAmount / tokenAmount)
    tokenPrice = Math.round(tokenPrice*precision) / precision
    ///////////////////////

    return({
        ...order,
        etherAmount: ether(etherAmount),
        tokenAmount: token(tokenAmount),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:m:ss a M/D')
    })
}