import React, { Component }       from 'react'
import { connect }                from 'react-redux'
import Chart                      from 'react-apexcharts'
import Spinner                    from './spinner'
import { chartOptions, dummyData} from './PriceChart.config'
import {
    priceChartLoadedSelector,
    priceChartSelector
} from '../store/selectors'

class PriceChart extends Component {
    render() {
        return(
        <div className="card bg-dark text-white">
              <div className="card-header">
                Price Chart
              </div>
              <div className="card-body">
                {this.props.priceChartLoaded ? showPriceChart(this.props.priceChart) : <Spinner /> }
              </div>
            </div>
        )
    }

}
const priceSymbol = (lastPriceChange) => {
    let output
    if(lastPriceChange === '+') {
        output = <span className='text-success'>&#9650;</span> //Green triangle
    }else {
        output = <span className='text-success'>&#9660;</span> // red triangle
    }
    return output
}


const showPriceChart = (priceChart) =>{
    return(
        <div className='price-chart'>
            <div className='price'>
                <h5>PBS/ETH &nbsp; {priceSymbol(priceChart.lastPriceChange)} &nbsp; {priceChart.lastPrice}</h5>
            </div>
            <Chart options={chartOptions} series={priceChart.series} type='candlestick' width='100%' height='100%' />
        </div>
    )
}




function mapStateToProps(state) {
    return {
        //asdfas
        priceChartLoaded: priceChartLoadedSelector(state),
        priceChart: priceChartSelector(state)
    }
}
export default connect(mapStateToProps)(PriceChart)