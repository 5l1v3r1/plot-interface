import React from "react"
import Plot from './plot'
import "./styles.css"

/* Must render the currentState */
const Setting = (props) => {
  return (
  <div>
    <Plot spec={props.blocks} renderer={"canvas"} error={false}/>
  </div>
)}

export default Setting
