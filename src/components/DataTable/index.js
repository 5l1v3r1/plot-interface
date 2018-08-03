import React, {Component} from 'react'
import {connect} from 'react-redux'
import dl from 'datalib'
import {MdKeyboardArrowLeft, MdKeyboardArrowRight} from 'react-icons/lib/md'
import Actions from "actions/world"

import "./styles.css"

class DataTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      limit: 20,
      page: 0,
      output: props.values,
      schema: props.schema,
    }
  }

  componentWillReceiveProps(nextProps) {
    // if (!nextProps.schema || !nextProps.spec.schema) {
    //   return
    // }
    this.setState({schema: nextProps.schema, output: nextProps.values})
  }

  prevPage() {
    this.setState({page: this.state.page - 1})
  }

  nextPage() {
    this.setState({page: this.state.page + 1})
  }

  clickHeader(e, header) {
    this.props.dispatch(Actions.setQuery((this.props.query + ' ' + header).trim()))
  }



  render() {
    const {page, limit, schema, output}  = this.state
    // if (!data) return <div className="dataTable">no data available <button>pick data source</button> </div>

    const start = page * limit
    const stop  = start + limit

    const values = output.slice(start, stop)
    const keys = dl.keys(schema)
    const max = output.length
    const fmt = dl.format.auto.number()

    let prev = page > 0 ? (
      <MdKeyboardArrowLeft className='md-button' size={30} onClick={() => this.prevPage()} />
    ) : null;

    let next = page + 1 < max / limit ? (
      <MdKeyboardArrowRight className='md-button' size={30} onClick={() => this.nextPage()} />
    ) : null;

    return (
      <div>
        <div className="dataTable">
          <table>
            <tbody>
              {keys.map(function(k) {
                return (
                  <tr key={k}>
                    <td className="schema" onClick={e => this.clickHeader(e, k)}>{k}</td>
                    {values.map(function(v, i) {
                      return (
                        <td key={k + i} className={i % 2 ? 'even' : 'odd'}>{v[k]}</td>
                      );
                    }, this)}
                  </tr>
                );
              }, this)}
            </tbody>
          </table>
        </div>

        <div className="paging">
          <span>{fmt(start + 1)}–{stop > max ? fmt(max) : fmt(stop)} of {fmt(max)}</span>
          <span className="pager">{prev} {next}</span>
        </div>
      </div>
    );
  }
}


function mapStateToProps(state, ownProps) {
  return {
    query: state.world.query,
  };
}

export default connect(mapStateToProps)(DataTable)
