import React, { Component } from "react"
import { connect }          from 'react-redux'
import Spinner              from "./spinner"
import { orderBookSelector,
         orderBookLoadedSelector,
         exchangeSelector,
         accountSelector,
         orderFillingSelector
} from "../store/selectors"
import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { fillOrder } from "../store/interactions"

const renderOrder = (order, props) => {
    const { dispatch, exchange, account } = props
    return(
        <OverlayTrigger 
            key={order.id}
            placement='auto'
            overlay={
                <Tooltip id={order.id}>
                    {`Click here to ${order.orderFillAction}`}
                </Tooltip>
            }
        >
        <tr 
            key={order.id}
            className='order-book-order'
            onClick={(e) => fillOrder(dispatch, exchange, order, account )}
        >
            <th>{order.tokenAmount}</th>
            <th className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</th>
            <th>{order.etherAmount}</th>
        </tr>
        </OverlayTrigger>
    )
}

const showOrderBook = (props) => {
    const { orderBook } = props 
    // this is es6. takes the props object and fetches orderBook key and assign it to a variable 
    return(
        <tbody>
            {orderBook.sellOrders.map((order) => renderOrder(order, props))}
            <tr>
                <th>PBS</th>
                <th>PBS/ETH</th>
                <th>ETH</th>
            </tr>
            {orderBook.buyOrders.map((order) => renderOrder(order, props))}
        </tbody>
    )
}

class OrderBook extends Component{
    render() {
        return(
            <div className="vertical">
            <div className="card bg-dark text-white">
              <div className="card-header">
                Order Book
              </div>
              <div className="card-body order-book">
                <table className='table table-dark table-sm small'>
                    { this.props.showOrderBook ? showOrderBook(this.props) : <Spinner type='table' />}
                </table>
              </div>
            </div>
          </div>
        )
    }
}

function mapStateToProps(state) {
    const orderBookLoaded = orderBookLoadedSelector(state)
    const orderFilling = orderFillingSelector(state)
    return {
        orderBook: orderBookSelector(state),
        showOrderBook: orderBookLoaded && !orderFilling,
        account: accountSelector(state),
        exchange: exchangeSelector(state)
    }
}

export default connect(mapStateToProps)(OrderBook)
