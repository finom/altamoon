import React, { ReactElement, useRef } from 'react';
import Widget from '../../layout/Widget';

const ChartWidget = (): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Widget title="Chart">
      <div ref={ref}>
        Hello
      </div>
    </Widget>
  );
};

export default ChartWidget;
