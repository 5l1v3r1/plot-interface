import React, {Component} from 'react'
import PropTypes from 'prop-types';
import { connect } from "react-redux"

import SplitPane from 'react-split-pane';
import Toolbar from 'components/Toolbar'
import LabelModal from 'components/LabelModal'
import CurrentDataTable from 'components/DataTable/CurrentDataTable'
import Candidates from './candidates.js'
import VegaLite from "components/Plot/VegaLite"
import UserActions from "actions/user"
import Actions from "actions/world"
import {getParameterByName} from "helpers/util"
import config from "config"
import "./styles.css"

class Build extends Component {
  static propTypes = {
    /* Injected by Redux */
    context: PropTypes.object,
    candidate: PropTypes.func,
    dispatch: PropTypes.func,
  }

  componentDidMount() {
    /* Set the appropriate sessionId (either turker id or generated) */
    this.props.dispatch(UserActions.setSessionId(getParameterByName('uid')))
    this.props.dispatch(Actions.verifierInit())
  }

  onLabel = (spec, formula) => {
    this.labelModal.onLabel(spec, formula)
  };

  skip() {
    this.props.dispatch(Actions.log({type: 'skip',  utterance: this.props.utterance}))
    this.props.dispatch(UserActions.increaseCount(-0.2))
    this.props.dispatch(Actions.verifierInit())
  }

  render() {
    if (this.props.count > config.numLabels)
      return 'You are done! Submit the code above and get another job. Thank you!'

    return (
      <div style={{position: 'relative', height: `calc(100vh - ${50}px)`}}>
        <SplitPane split="vertical" minSize={100} defaultSize={window.innerWidth * 0.35} pane1Style={{display: 'flex', height: "100%", backgroundColor: "white"}} className='main-pane' pane2Style={{overflow: 'scroll', backgroundColor: 'white'}}>
          <div className='editor-container'>
            <div>
              Choose the plot that you would produce if you are given the command below.
            </div>
            <div>
              <b>Command</b>: {this.props.utterance}
            </div>
            <div className='button-row'>
              <button className="active" onClick={() => {this.skip()}}>Skip (-0.2pts)</button>
            </div>

            {config.showDataTable? <CurrentDataTable/> : null}
            <div className='chart-container' key='current'>
              {
                this.props.isInitial?
                'no current plot'
                :
                <VegaLite
                  spec={this.props.context}
                  dataValues={this.props.dataValues}
                />
              }
            </div>
        </div>
        <Candidates onLabel={this.onLabel} candidate={this.props.candidate} verifierMode={true}/>
        </SplitPane>
        <LabelModal onRef={ref => (this.labelModal = ref)} readOnly={true}/>
        <Toolbar onLabel={this.onLabel}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isInitial: Object.keys(state.world.context).length === 0,
  context: state.world.context,
  world: state.world.context,
  utterance: state.world.issuedQuery,
  count: state.user.count,
})

export default connect(mapStateToProps)(Build)
