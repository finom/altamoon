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
  }), [
    chartPaddingBottomPercent, chartPaddingRightPercent, chartPaddingTopPercent,
    listenSettingsSave, paddingBottomStr, paddingRightStr,
    paddingTopStr, setChartPaddingBottomPercent,
    setChartPaddingRightPercent, setChartPaddingTopPercent,
  ]);

  useEffect(() => listenSettingsCancel(() => {
    setPaddingTopStr(String(chartPaddingTopPercent));
    setPaddingBottomStr(String(chartPaddingBottomPercent));
    setPaddingRightStr(String(chartPaddingRightPercent));
  }), [
    chartPaddingBottomPercent, chartPaddingRightPercent,
    chartPaddingTopPercent, listenSettingsCancel,
  ]);

  return (
    <Row>
      <Col xs={4}>
        <Label htmlFor="chartPaddingTop" className="form-label">Padding top %</Label>
        <Input
          type="number"
          id="chartPaddingTop"
          value={paddingTopStr}
          onChange={({ target }) => setPaddingTopStr(target.value)}
        />
      </Col>
      <Col xs={4}>
        <Label htmlFor="chartPaddingBottom" className="form-label">Padding bottom %</Label>
        <Input
          type="number"
          id="chartPaddingBottom"
          value={paddingBottomStr}
          onChange={({ target }) => setPaddingBottomStr(target.value)}
        />
      </Col>
      <Col xs={4}>
        <Label htmlFor="chartPaddingRight" className="form-label">Padding right %</Label>
        <Input
          type="number"
          id="chartPaddingRight"
          value={paddingRightStr}
          onChange={({ target }) => setPaddingRightStr(target.value)}
        />
      </Col>
    </Row>
  );
};

export default memo(ChartSettings);
