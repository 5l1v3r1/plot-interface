import React, { Component } from "react"
import { connect } from "react-redux"
import classnames from "classnames"
import Actions from "actions/world"
import Modal from "react-modal"
import VegaLite from "plot/VegaLite"
import DiffEditor from './DiffEditor'
import "./styles.css"

const headerText = 'Edit and label';
class LabelModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      inputValue: props.issuedQuery,
      headerText: headerText,
    }
  }

  componentDidMount() {
    this.props.onRef(this)

  }
  componentWillUnmount() {
    this.props.onRef(null)
  }

  // note that props.issuedQuery is the query used to retrieve the original results
  // vs. props.query, which tracks the live value in query box
  onLabel(spec, formula) {
    this.setState({isOpen: true, spec: spec, formula: formula, inputValue: this.props.issuedQuery,})
  }

  close() {this.setState({headerText: headerText, inputValue: '', isOpen: false})}

  submit(value) {
    this.props.dispatch(Actions.accept(this.state.spec));
    this.props.dispatch(Actions.label(value, this.state.spec));
    this.close()
    // this.setState({headerText: `labeled this plot as "${value}"...` })
    // setTimeout(() => {this.close()}, 800);
  }

  handleKeyDown(e) {
    if (e.keyCode === 13) {
      this.submit(this.state.inputValue)
    } else if (e.keyCode === 27) {
      this.close()
    }
  }

  updateInputValue(evt) {
    this.setState({inputValue: evt.target.value})
  }


  render() {
    const style = {
      overlay: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(75,75,75,0.5)',
        justifyContent: 'center'
      },
      content: {
        // position: null,
        overflow: 'hidden',
        top: null, bottom: null, left: null, right: null,
        width: 'auto',
        height: 'auto',
        padding: '10px',
        margin: '20px',
      }
    };
    const {context} = this.props
    const {spec} = this.state

    let body
    if (Object.keys(context).length === 0) {
      body = (
        <div className="before-after">
          <div className="before">
            <div className="label">"New plot"</div>
            <VegaLite spec={spec} dataValues={this.props.dataValues}/>
          </div>
        </div>
      )
    } else {
      body = (
      <div className="before-after">
        <div className="before">
          <div className="label">"Before"</div>
          <VegaLite spec={context} dataValues={this.props.dataValues}/>
        </div>
        <div className="before">
          <div className="label">"After"</div>
          <VegaLite spec={spec} dataValues={this.props.dataValues}/>
        </div>
      </div>
      )
    }

    return (

      <Modal
        isOpen={this.state.isOpen}
        onRequestClose={() => this.close()}
        style={style}
        contentLabel="label-modal"
        // style={{content : {left:`${this.state.x}px`, top:`${this.state.y}px`}}}
      >
      <div className="header">{this.state.headerText}</div>
      {body}
      <DiffEditor context={context} initial={spec} update={(spec) => this.setState({spec})}/>
      <div className="info">Provide a command (in English) that changes "before" to "after":</div>
      <input autoFocus ref={(input) => { this.textInput = input; }} className="label-box"
        type="text"
        value={this.state.inputValue}
        onKeyDown={e => this.handleKeyDown(e)}
        onChange={e => this.updateInputValue(e)}
        placeholder={'Provide a command that would change "before" to "after":'}
      />
      <div className='control-bar'>
        <button className={classnames({active: this.state.inputValue.trim().length>0})} onClick={() => this.submit(this.state.inputValue)}>Submit (enter)</button>
        <button className={classnames({active: true})} onClick={() => this.close()}>Close (ESC)</button>
      </div>
    </Modal>
    )
  }
}

const mapStateToProps = (state) => ({
  issuedQuery: state.world.issuedQuery,
  context: state.world.context,
  dataValues: state.world.dataValues,
})

export default connect(mapStateToProps)(LabelModal)
