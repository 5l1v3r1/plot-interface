import React from 'react'
import Autosuggest from 'react-autosuggest'
import './autocomplete.css'
import {VEGALITE_ENUMS} from './VegaConstants/vegalite-enums'
import {VEGALITE_PATHS} from './VegaConstants/vegalite-paths'

const suggestionLexicon = VEGALITE_ENUMS.concat(VEGALITE_PATHS)

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
// const escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getSuggestions = value => {
  let tokens = value.split(" ")
  const lastToken = tokens.pop().trim()
  //const partial = escapeRegexCharacters(lastToken.trim());
  if (lastToken === '') {
    return [];
  }
  const prefix = lastToken.length < 2? new RegExp('^' + lastToken, 'i') : new RegExp(lastToken, 'i');
  return suggestionLexicon.filter(name => prefix.test(name)).map(last => tokens.join(' ') + ' ' + last);
}

const getSuggestionValue = suggestion => suggestion;
const renderSuggestion = suggestion => suggestion;

export default class Autocomplete extends React.Component {
  constructor() {
    super();
    this.state = {
      value: '',
      suggestions: []
    };
  }

  onChange = (event, { newValue, method }) => {
    this.setState({
      value: newValue
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
     autoFocus: true,
     placeholder: "type here",
     value: value,
     onChange: (event, { newValue, method }) => {this.onChange(event, { newValue, method }); this.props.inputProps.onChange(event)},
     onKeyDown: e => this.props.inputProps.onKeyDown(e)
   };
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />
    );
  }
}