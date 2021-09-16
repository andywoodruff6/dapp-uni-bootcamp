import { get, groupBy, reject } from 'lodash'
import moment                   from 'moment'
import { createSelector }       from "reselect"
import { ETHER_ADDRESS, 
         token, 
         ether,
         GREEN,
         RED }            from '../helpers'

const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)
// const account = state => state.web3.account
// export const accountSelector = createSelector(account, a => a)
// ^ this is a routine pattern when we want to fetch items from the state 

// Loading basic states to be used in App.js 
const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchange = state => get(state, 'exchange.contract')
export const exchangeSelector = createSelector(exchange, e => e)
const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const filledOdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

export const contractsLoadedSelector = createSelector(
    tokenLoaded,
    exchangeLoaded,
    (tl, el) => (tl && el)
)
// This follows the same pattern as above.
// CANCELLED ORDERS
const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false)
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, loaded => loaded)

const cancelledOrders = state => get(state, 'exchange.cancelledOrders.date', [])
export const cancelledOrdersSelector = createSelector(cancelledOrders, o => o)

// 1) Set up filledOrders like above, except this is an array
// 2) Take orders and sort ascending (a-b) for decorating
// 3) Apply styling to the tokenPrice
// 4) Take orders and sort descending (b-a) for display
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])
export const filledOdersSelector = createSelector(
    filledOrders,
    (orders) => {
        orders = orders.sort((a,b) => a.timestamp - b.timestamp)
        orders = decorateFilledOrders(orders)
        orders = orders.sort((a,b) => b.timestamp - a.timestamp)
        return orders
    } )
// 1) bring in all the orders from the smart contract
// 2) set up previous order to track history
// 3) map decorateOrder and decorateFilledOrder through
// 4) reset prviousOrder to order for loop
const decorateFilledOrders = (orders) => {
    let previousOrder = orders[0]
    return(
        orders.map((order) =>{
            order = decorateOrder(order)
            order = decorateFilledOrder(order, previousOrder)
            previousOrder = order 
            return order
        })
    )
}
// 1) setting decorateFilledOrder as a pass through so when called above just
//    gets us the long return statement
const decorateFilledOrder = (order, previousOrder) => {
    return({
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
    })
}
// 1) Goal is to properly color the orders in Trades.js
// 2) GREEN for higher price, RED for lower price
const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    if(previousOrder.id === orderId) { return GREEN }
    if(previousOrder.tokenPrice <= tokenPrice) {
        return GREEN
    } else {
        return RED
    }
}
// 1) take in an order 
// 2) asign the correct title to GIVE and GET
// 3) Create tokenPrice
// 4) Set the returns so this can be used in UI
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
// OPEN ORDERS
const allOrdersLoaded = state => get(state, 'exchange.allOrders.loaded', false)
const allOrders = state => get(state, 'exchange.allOrders.data', [])

const openOrders = state => {
    const all       = allOrders(state)
    const cancelled = cancelledOrders(state)
    const filled    = filledOrders(state)
    // In openOrders, we rejected if true. 
    // The expression we are checking, checks inside the filled array 
    // and if the id's match then the order has been filled.
    // Then do the same thing for cancelled
    const openOrders = reject(all, (order) => {
        const orderFilled = filled.some((o) => o.id === order.id)
        const orderCanceled = cancelled.some((o) => o.id === order.id)
        return(orderFilled || orderCanceled)
    })
    return openOrders
}
const orderBookLoaded = state => cancelledOrdersLoaded(state) && 
                                 filledOrdersLoaded(state)    && 
                                 allOrdersLoaded(state)
export const orderBookLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)

// Create order book
export const orderBookSelector = createSelector(
    openOrders,
    (orders) => {
        //Decorate orders
        orders = decorateOrderBookOrders(orders)
        orders = groupBy(orders, 'orderType')

        const buyOrders  = get(orders, 'buy', [])
        orders = {
            ...orders,
            buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
        }
        const sellOrders = get(orders, 'sell', [])
        orders = {
            ...orders,
            sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
        }
        return orders
    }
)

const decorateOrderBookOrders = (orders) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order)
            order = decorateOrderBookOrder(order)
            return (order)
        })
    )
}
const decorateOrderBookOrder = (order) => {
    const orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
    return({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        orderFilledClass: orderType === 'buy' ? 'sell' : 'buy'
    })
}

///////////////////////////////////////////////////////////////////////////////////////////

// // const myfilledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const myFilledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

export const myFilledOrdersSelector = createSelector(
    account,
    filledOrders,
    (account, orders) => {
        orders = orders.filter((o) => o.user === account || o.userFill === account)
        orders = orders.sort((a,b) => a.timestamp - b.timestamp)
        orders = decorateMyFilledOrders(orders, account)
        return orders
    }
)

const decorateMyFilledOrders = (orders, account) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order)
            order = decorateMyFilledOrder(order, account)
            return(order)
        })
    )
}
const decorateMyFilledOrder = (order, account) => {
    const myOrder = order.user === account
    let orderType

    if(myOrder) {
        orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
    } else{
        orderType = order.tokenGive === ETHER_ADDRESS ? 'sell' : 'buy'
    }
    return({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        orderSign: (orderType === 'buy' ? '+' : '-')
    })   
}

export const myOpenOrdersLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)
export const myOpenOrdersSelector = createSelector(
    account,
    openOrders,
    (account, orders) => {
        orders = orders.filter((o) => o.user === account)
        orders = decorateMyOpenOrders(orders)
        orders = orders.sort((a,b) => b.timestamp - a.timestamp)
        return(orders)
    }
)

const decorateMyOpenOrders = (orders, account) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order)
            order = decorateMyOpenOrder(order, account)
            return (order)
        })
    )
}

const decorateMyOpenOrder = (order, account) => {
    let orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'

    return({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED)
    })
}