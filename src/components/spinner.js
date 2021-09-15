import React from 'react'

// This gives a spinning animation for cards
// bootstrap doesn't play well when mixing table and div
// so they are called seperatly 
export default function ({ type }) {
    if(type === 'table') {
        return(<tbody className='spinner-border text-light text-center'></tbody>)
    }else {
        return(<div className='spinner-border text-light text-center'></div>)
    }
}