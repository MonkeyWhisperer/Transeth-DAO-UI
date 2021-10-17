import { init, apm, apmBase, ApmBase } from './index';
import { Tracer } from 'opentracing/lib/tracer';
import { createTracer as createElasticTracer } from '@elastic/apm-rum-core';

function createTracer(apmBase) {
  if (apmBase._disable) {
    return new Tracer();
  }

  return createElasticTracer(apmBase.serviceFactory);
}

if (typeof window !== 'undefined' && window.elasticApm) {
  window.elasticApm.createTracer = createTracer.bind(window.elasticApm, window.elasticApm);
}

export default createTracer;
export { createTracer, init, apm, apmBase, ApmBase };