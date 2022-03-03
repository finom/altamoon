import React, { ReactElement, useEffect, useState } from 'react';
import {
  Col, Input, Label, Row,
} from 'reactstrap';
import useChange from 'use-change';
import { PERSISTENT } from '../../../../store';
import FormSwitch from '../../../controls/FormSwitch';
import { WidgetSettingsProps } from '../../../layout/Widget/WidgetSettingsModal';

const GeneralSettings = ({
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

  const [chartShouldShowBidAskLines, setChartShouldShowBidAskLines] = useChange(PERSISTENT, 'chartShouldShowBidAskLines');
  const [
    chartShouldShowBidAskLinesValue, setChartShouldShowBidAskLinesValue,
  ] = useState(chartShouldShowBidAskLines);

  const [shouldShowSubminuteIntervals, setShouldShowSubminuteIntervals] = useChange(PERSISTENT, 'chartShouldShowSubminuteIntervals');
  const [
    shouldShowSubminuteIntervalsValue, setShouldShowSubminuteIntervalsValue,
  ] = useState(shouldShowSubminuteIntervals);

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

    setChartShouldShowBidAskLines(chartShouldShowBidAskLinesValue);

    setShouldShowSubminuteIntervals(shouldShowSubminuteIntervalsValue);
  }), [
    chartOrdersNumber, chartOrdersNumberStr, chartPaddingBottomPercent, chartPaddingRightPercent,
    chartPaddingTopPercent, chartShouldShowBidAskLinesValue, chartUpdateFrequency,
    chartUpdateFrequencyStr, listenSettingsSave, paddingBottomStr, paddingRightStr,
    paddingTopStr, setChartOrdersNumber, setChartPaddingBottomPercent,
    setChartPaddingRightPercent, setChartPaddingTopPercent, setChartShouldShowBidAskLines,
    setChartUpdateFrequency, setShouldShowSubminuteIntervals, shouldShowSubminuteIntervalsValue,
  ]);

  useEffect(() => listenSettingsCancel(() => {
    setPaddingTopStr(String(chartPaddingTopPercent));
    setPaddingBottomStr(String(chartPaddingBottomPercent));
    setPaddingRightStr(String(chartPaddingRightPercent));
    setChartOrdersNumberStr(String(chartOrdersNumber));
    setChartUpdateFrequencyStr(String(chartUpdateFrequency));
    setChartShouldShowBidAskLinesValue(chartShouldShowBidAskLines);
    setShouldShowSubminuteIntervalsValue(shouldShowSubminuteIntervals);
  }), [
    chartOrdersNumber, chartPaddingBottomPercent, chartPaddingRightPercent,
    chartPaddingTopPercent, chartShouldShowBidAskLines, chartUpdateFrequency,
    listenSettingsCancel, shouldShowSubminuteIntervals,
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
      <Row className="mt-3">
        <Col xs={6} md={4}>
          <Label htmlFor="chartUpdateFrequency" className="form-label">Update frequency (ms)</Label>
          <Input
            type="number"
            id="chartUpdateFrequency"
            value={chartUpdateFrequencyStr}
            onChange={({ target }) => setChartUpdateFrequencyStr(target.value)}
          />
        </Col>
        <Col xs={6} md={4} className="pt-3">
          <Label className="form-label mt-4">
            <FormSwitch
              id="chartShouldShowBidAskLines"
              className="d-inline-block align-middle"
              onChange={setChartShouldShowBidAskLinesValue}
              isChecked={chartShouldShowBidAskLinesValue}
            />
            {' '}
            Show bid/ask lines
          </Label>
        </Col>
        <Col xs={6} md={4} className="pt-3">
          <Label className="form-label mt-4">
            <FormSwitch
              id="shouldShowSubminuteIntervals"
              className="d-inline-block align-middle"
              onChange={setShouldShowSubminuteIntervalsValue}
              isChecked={shouldShowSubminuteIntervalsValue}
            />
            {' '}
            Enable subminute timeframes
          </Label>
        </Col>
      </Row>
    </>
  );
};

export default GeneralSettings;
