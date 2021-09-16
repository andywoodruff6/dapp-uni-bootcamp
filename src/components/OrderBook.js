import React, { Component } from "react"
import { connect }          from 'react-redux'
import Spinner              from "./spinner"
import { orderBookSelector,
         orderBookLoadedSelector
} from "../store/selectors"

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

const showOrderBook = (props) => {
    const { orderBook } = props 
    // this is es6. takes the props object and fetches orderBook key and assign it to a variable 
    return(
        <tbody>
            {orderBook.sellOrders.map((order) => renderOrder(order))}
            <tr>
                <th>PBS</th>
                <th>PBS/ETH</th>
                <th>ETH</th>
            </tr>
            {orderBook.buyOrders.map((order) => renderOrder(order))}
        </tbody>
    )
}

const renderOrder = (order) => {
    return(
        <tr key={order.id}>
            <th>{order.tokenAmount}</th>
            <th className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</th>
            <th>{order.etherAmount}</th>
        </tr>
    )
}

function mapStateToProps(state) {
    return {
        orderBook: orderBookSelector(state),
        showOrderBook: orderBookLoadedSelector(state)
    }
}

export default connect(mapStateToProps)(OrderBook)
