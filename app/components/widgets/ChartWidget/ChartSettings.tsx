import React, {
  memo, ReactElement, useEffect, useState,
} from 'react';
import {
  Col, Input, Label, Row,
} from 'reactstrap';
import useChange from 'use-change';

import { PERSISTENT } from '../../../store';
import { WidgetSettingsProps } from '../../layout/Widget';

const ChartSettings = ({
  listenSettingsCancel, listenSettingsSave,
}: WidgetSettingsProps): ReactElement => {
  const [chartPaddingTopPercent, setChartPaddingTopPercent] = useChange(PERSISTENT, 'chartPaddingTopPercent');
  const [paddingTopStr, setPaddingTopStr] = useState(String(chartPaddingTopPercent));

  const [chartPaddingBottomPercent, setChartPaddingBottomPercent] = useChange(PERSISTENT, 'chartPaddingBottomPercent');
  const [paddingBottomStr, setPaddingBottomStr] = useState(String(chartPaddingBottomPercent));

  const [chartPaddingRightPercent, setChartPaddingRightPercent] = useChange(PERSISTENT, 'chartPaddingRightPercent');
  const [paddingRightStr, setPaddingRightStr] = useState(String(chartPaddingRightPercent));

  const [chartOrdersNumber, setChartOrdersNumber] = useChange(PERSISTENT, 'chartOrdersNumber');
  const [chartOrdersNumberStr, setChartOrdersNumberStr] = useState(String(chartOrdersNumber));

  const [chartUpdateFrequency, setChartUpdateFrequency] = useChange(PERSISTENT, 'chartUpdateFrequency');
  const [
    chartUpdateFrequencyStr, setChartUpdateFrequencyStr,
  ] = useState(String(chartUpdateFrequency));

  useEffect(() => listenSettingsSave(() => {
    setChartPaddingTopPercent(
      Number.isNaN(+paddingTopStr) ? chartPaddingTopPercent : +paddingTopStr,
    );

    setChartPaddingBottomPercent(
      Number.isNaN(+paddingBottomStr) ? chartPaddingBottomPercent : +paddingBottomStr,
    );

    setChartPaddingRightPercent(
      Number.isNaN(+paddingRightStr) ? chartPaddingRightPercent : +paddingRightStr,
    );

    setChartOrdersNumber(
      Number.isNaN(+chartOrdersNumberStr) ? chartOrdersNumber : +chartOrdersNumberStr,
    );

    setChartUpdateFrequency(
      Number.isNaN(+chartUpdateFrequencyStr) ? chartUpdateFrequency : +chartUpdateFrequencyStr,
    );
  }), [
    chartOrdersNumber, chartOrdersNumberStr, chartPaddingBottomPercent, chartPaddingRightPercent,
    chartPaddingTopPercent, chartUpdateFrequency, chartUpdateFrequencyStr, listenSettingsSave,
    paddingBottomStr, paddingRightStr, paddingTopStr, setChartOrdersNumber,
    setChartPaddingBottomPercent,
    setChartPaddingRightPercent, setChartPaddingTopPercent, setChartUpdateFrequency,
  ]);

  useEffect(() => listenSettingsCancel(() => {
    setPaddingTopStr(String(chartPaddingTopPercent));
    setPaddingBottomStr(String(chartPaddingBottomPercent));
    setPaddingRightStr(String(chartPaddingRightPercent));
    setChartOrdersNumberStr(String(chartOrdersNumber));
    setChartUpdateFrequencyStr(String(chartUpdateFrequency));
  }), [
    chartOrdersNumber, chartPaddingBottomPercent, chartPaddingRightPercent,
    chartPaddingTopPercent, chartUpdateFrequency, listenSettingsCancel,
  ]);

  return (
    <>
      <Row>
        <Col xs={6} md={3}>
          <Label htmlFor="chartPaddingTop" className="form-label">Top margin %</Label>
          <Input
            type="number"
            id="chartPaddingTop"
            value={paddingTopStr}
            onChange={({ target }) => setPaddingTopStr(target.value)}
          />
        </Col>
        <Col xs={6} md={3}>
          <Label htmlFor="chartPaddingBottom" className="form-label">Bottom margin %</Label>
          <Input
            type="number"
            id="chartPaddingBottom"
            value={paddingBottomStr}
            onChange={({ target }) => setPaddingBottomStr(target.value)}
          />
        </Col>
        <Col xs={6} md={3} className="mt-2 mt-md-0">
          <Label htmlFor="chartPaddingRight" className="form-label">Right margin %</Label>
          <Input
            type="number"
            id="chartPaddingRight"
            value={paddingRightStr}
            onChange={({ target }) => setPaddingRightStr(target.value)}
          />
        </Col>
        <Col xs={6} md={3} className="mt-2 mt-md-0">
          <Label htmlFor="chartOrdersNumber" className="form-label">Filled orders max</Label>
          <Input
            type="number"
            id="chartOrdersNumber"
            value={chartOrdersNumberStr}
            onChange={({ target }) => setChartOrdersNumberStr(target.value)}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={6} md={3}>
          <Label htmlFor="chartUpdateFrequency" className="form-label">Update frequency (ms)</Label>
          <Input
            type="number"
            id="chartUpdateFrequency"
            value={chartUpdateFrequencyStr}
            onChange={({ target }) => setChartUpdateFrequencyStr(target.value)}
          />
        </Col>
      </Row>
    </>
  );
};

export default memo(ChartSettings);
