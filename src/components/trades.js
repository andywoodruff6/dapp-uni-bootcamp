import React, { Component } from "react"
import { connect }          from "react-redux"
import Spinner              from "./spinner"
import { 
    filledOdersLoadedSelector, 
    filledOdersSelector }   from "../store/selectors"

class Trades extends Component {
    render() {
        return (
            <div className="vertical">
                <div className="card bg-dark text-white">
                <div className="card-header">
                    Open Trades
                </div>
                <div className="card-body">
                    <table className="table table-dark table-sm small">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>PBS</th>
                                <th>PBS/ETH</th>
                            </tr>
                        </thead>
                        { this.props.filledOrdersLoaded ? 
                          showFilledOrders(this.props.filledOrders) : 
                          <Spinner type='table'/>}
                    </table>
                </div>
                </div>
            </div>
        )
    }
}

// setting up the tbody to use information from filledOrders
// 1) map filledOrders into order
// 2) set up a key of order.id to avoid errors 
// 3) pass in the three columns of data that was formatted in selectors.js
const showFilledOrders = (filledOrders) => {
    return(
    <tbody>
    { filledOrders.map((order) => {
        return(
          <tr className={`order-${order.id}`} key={order.id}>
              <td className="text-muted">{ order.formattedTimestamp}</td>
              <td>{order.tokenAmount}</td>
              <td className={`text-${order.tokenPriceClass}`}>{order.tokenPrice}</td>
          </tr>
        )
    })}
  </tbody>
    )
}

function mapStateToProps(state) {
    return {
        filledOrdersLoaded: filledOdersLoadedSelector(state),
        filledOrders:       filledOdersSelector(state)
    }
}
// connecting all of the above code to Trades to be used in App.js
export default connect(mapStateToProps)(Trades)