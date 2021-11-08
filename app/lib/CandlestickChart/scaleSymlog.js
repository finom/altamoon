/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { linearish } from 'd3-scale/src/linear';
import { copy, transformer } from 'd3-scale/src/continuous';
import { initRange } from 'd3-scale/src/init';

function transformSymlog(c) {
  return function (x) {
    // console.log('transformSymlog', x, Math.sign(x) * Math.log1p(Math.abs(x / c)));
    return Math.sign(x) * Math.log1p(Math.abs(x / c));
  };
}

function transformSymexp(c) {
  return function (x) {
    // console.log('transformSymexp', x, Math.sign(x) * Math.expm1(Math.abs(x)) * c);
    return Math.sign(x) * Math.expm1(Math.abs(x)) * c;
  };
}

export function symlogish(transform) {
  let c = 1;
  const scale = transform(transformSymlog(c), transformSymexp(c));

  scale.constant = function (_) {
    return arguments.length ? transform(transformSymlog(c = +_), transformSymexp(c)) : c;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scale.doSomething = (yDomain) => {
    // console.log(yDomain);
  };

  return linearish(scale);
}

export default function symlog() {
  const scale = symlogish(transformer());

  scale.copy = function () {
    return copy(scale, symlog()).constant(scale.constant());
  };

  return initRange.apply(scale, arguments);
}
