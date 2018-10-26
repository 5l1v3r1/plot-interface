import React, { Component } from "react"
import { connect } from "react-redux"
import PropTypes from 'prop-types';
import VegaLite from "components/Plot/VegaLite"
import { Checkbox, Button, Modal, Input, Menu, Popup} from 'semantic-ui-react'
import Actions from 'actions/world'
// import {prettyStringify, editorURL} from 'helpers/vega-utils'
import {execute} from 'helpers/util'

// const inputProps = (schema) => {
//   const {type} = schema
//   console.log(schema)
//   if (type === 'number') {
//     const props = {type: 'number', step: 0.5}
//     const {minimum, maximum} = schema
//     if (minimum !== undefined)
//       props.min = minimum
//     if (maximum !== undefined)
//       props.max = maximum
//     if (minimum!== undefined && maximum!== undefined)
//       props.step = (maximum - minimum) / 10
//     return props
//   } else {
//     return {type: 'text', disabled: true}
//   }
// }


class LabelModal extends Component {
  static propTypes = {
    candidate: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    const {candidate} = props
    this.state = {
      overlay: true,
      spec: candidate.value,
      patch: candidate.canonical_patch[0],
      value: candidate.canonical_patch[0].value,
    }
  }

  toggleOverlay(evt) {
    this.setState({overlay: !this.state.overlay})
  }

  setValue(e, value) {
    this.setState({value: value})
  }

  accept() {
    const {spec, patch} = this.state
    this.props.dispatch(Actions.accept(spec, patch));
  }

  render() {
    const {context, candidate} = this.props
    const {schema} = candidate
    const {overlay, spec, value, patch} = this.state
    const path = patch.path

    let coercedValue
    try {
      coercedValue = JSON.parse(value);
    } catch(e) {
      coercedValue = value
    }
    patch.value = coercedValue
    // deep copy spec if you'd not see a permanat ef
    const patchedSpec = JSON.parse(JSON.stringify(execute(spec, [patch])))

    const currentPlot = (
        <div style={{top: '0px', paddingLeft: '100px', position: "relative"}}>
          <div className={this.state.overlay? "overlay-top" : "overlay-bot"} >
            <VegaLite spec={patchedSpec} dataValues={this.props.dataValues} bigSize={true}/>
          </div>
          <div className={this.state.overlay? "overlay-bot" : "overlay-top"} >
            <VegaLite spec={context} dataValues={this.props.dataValues} bigSize={true}/>
          </div>
        </div>
    )

    const PatchUI = (
      <Input
        value={String(value)}
        onChange={(e, d) => this.setValue(e, d.value)}
      >
        <Popup
          trigger={<Button> {path} </Button>}
          content={schema.description}
          size="large"
          flowing
        />
        <input/>
      </Input>
    )

    return (
      <Modal size="large"
        // closeIcon={true}
        open={true}
        onClose={() => this.props.onClose()}
        // onRequestClose={() => this.close()}
        // style={style}
        // contentLabel="label-modal"
      >
      <Modal.Header>
        Compare and Edit
      </Modal.Header>
      {PatchUI}
      <Menu tabular>
        <Menu.Item
          name='old plot'
          active={!overlay}
          onClick={() => {this.setState({overlay: false})}}
        />
        <Menu.Item
          name='new plot'
          active={overlay}
          onClick={() => {this.setState({overlay: true})}}
        />
      </Menu>
      {currentPlot}

      <Modal.Actions>
        <Checkbox toggle label="show new" onChange={() => this.toggleOverlay()} checked={this.state.overlay}/>
        {/* <Button onClick={() => window.open(editorURL(prettyStringify(patchedSpec)), '_blank')}>Open in Editor</Button> */}
        <Button primary onClick={() => this.accept()}>Use</Button>
        <Button negative onClick={() => this.props.onClose()}>Close</Button>
      </Modal.Actions>
    </Modal>
    )
  }
}

const mapStateToProps = (state) => ({
  issuedQuery: state.world.issuedQuery,
  context: state.world.context,
  dataValues: state.world.dataValues,
  schema: state.world.schema,
})

export default connect(mapStateToProps)(LabelModal)
