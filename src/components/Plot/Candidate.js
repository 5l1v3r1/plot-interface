import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Actions from 'actions/world'
import hash from 'string-hash'
import InnerChart from './InnerChart'
import { Button, Label, Header } from 'semantic-ui-react'
import InspectModal from 'components/LabelModal/InspectModal'
import TeachingModal from 'components/LabelModal/TeachingModal'

import './candidate.css'

class Plot extends React.PureComponent {
  static propTypes = {
    candidate: PropTypes.object,
    dataURL: PropTypes.string,
    logger: PropTypes.object,
    showTools: PropTypes.bool,
    onLabel: PropTypes.func,
  }

  constructor(props) {
    super(props)
    const {logger} = this.props;
    const hasError = logger.warns.length > 0 || logger.errors.length > 0;
    this.config = { showTools: true, iconSize: 20}
    this.state = { isClosed: false, inspectModal: false, teachModal: false, hasError, ...props}
  }

  accept() {
    const {value, formula} = this.props.candidate
    this.props.dispatch(Actions.accept(value, formula));
  }

  remove() {
    this.setState({isClosed: true})
  }

  onLabel() {
    this.setState({inspectModal: true})
  }

  onTeach() {
    this.setState({teachModal: true})
  }

  onClick(e) {
    console.log('plotHash', hash(this.state.dataURL))
    // let newWindow = window.open(this.state.dataURL, '')
    // const img = new Image()
    // img.src = this.state.dataURL
    // newWindow.document.write(img.outerHTML)
  }

  renderChart() {
    const equalMsg = this.state.isEqual? <li className='display-errors' key={'equalmsg'}>no change</li>: null
    const errors = this.state.logger.errors.map((v, i) => <li className='display-errors' key={'error'+i}>{v}</li>)
    const warns = this.state.logger.warns.map((v, i) => <li className='display-warns' key={'warn'+i}>{v}</li>)
    const {candidate} = this.props

    return (
      <div className='chart-container'>
        <Button.Group basic>
          <Button icon='magnify' content='Open' onClick={() => this.onLabel()} />
          <Button icon='comment' content='Teach' onClick={() => this.onTeach()} />
          <Button icon='check' content='Use' onClick={(e) => this.accept()} />
          {/* <Button icon='close' onClick={(e) => this.remove()} /> */}
        </Button.Group>
        <div>
          <Label>{candidate.formula}</Label>
        </div>
        <div>
          <div className='chart' onClick={e => this.onClick(e)}>
            <InnerChart dataURL={this.state.dataURL}/>
          </div>
          <div>
            <ul> {[equalMsg, ...errors.concat(warns)]} </ul>
          </div>
        </div>

        {this.state.inspectModal?
          <InspectModal candidate={candidate} onClose={() => this.setState({inspectModal: false})}/>: null}

        {this.state.teachModal?
          <TeachingModal candidate={candidate} onClose={() => this.setState({teachModal: false})}/>: null}
      </div>
    )
  }

  render() {
    if (!this.props.showErrors && this.state.hasError)
      return null;
    if (this.state.isClosed)
      return null;
    return (
      this.renderChart()
    );
  }
}

const mapStateToProps = (state) => ({
  // context: state.world.context,
  showErrors: state.world.showErrors,
})
export default connect(mapStateToProps)(Plot);
