import Ajv from 'ajv';
import {LocalLogger} from '../helpers/logger'
import * as vl from 'vega-lite';
import * as vega from 'vega';

const ajv = new Ajv({
  jsonPointers: true,
  allErrors: false
});

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

const vegaValidator = ajv.compile(require('../../schema/vega.schema.json'));
const vegaLiteValidator = ajv.compile(require('../../schema/vl.schema.json'));

export function validateVegaLite(spec, logger) {
  const valid = vegaLiteValidator(spec);
  if (!valid) {
    for (const error of vegaLiteValidator.errors) {
      logger.warn(`Validation: ${error.dataPath} ${error.message}`);
    }
  }
}

export function validateVega(spec, logger) {
  const valid = vegaValidator(spec);
  if (!valid) {
    for (const error of vegaValidator.errors) {
      logger.warn(`Validation: ${error.dataPath} ${error.message}`);
    }
  }
}

export function parseAndCheckStr(jsonStr) {
  return parseWithErrors(JSON.parse(jsonStr))
}

export function parseWithErrors(spec) {
  const currLogger = new LocalLogger();
  let vegaSpec
  try {
    validateVegaLite(spec, currLogger);
    vegaSpec = vl.compile(spec, currLogger).spec;
    validateVega(vegaSpec, currLogger);
  } catch (e) {
    currLogger.error(e.message);
    return {vegaSpec: {}, logger: currLogger}
  }
  return {vegaSpec: vegaSpec, logger: currLogger}
}

export function promiseWithErrors(spec) {
  let retval = parseWithErrors(spec);
  let view = new vega.View(retval.vegaSpec)
  .logLevel(vega.Warn)
  .initialize();
  view.run();

  return view.toSVG()
    //.then(function(svg) { console.log('got svg'); return {'svg': svg, ...retval} })
    //.catch(function(err) { console.error(err); return {'svg': null, ...retval}});
}
