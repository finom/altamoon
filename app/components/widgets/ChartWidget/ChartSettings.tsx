import React, {
  memo, ReactElement, useEffect, useState,
} from 'react';
import {
  Col, Input, Label, Row,
} from 'reactstrap';
import useChange from 'use-change';

import { PERSISTENT } from '../../../store';
import FormSwitch from '../../controls/FormSwitch';
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

  const [chartShouldShowBidAskLines, setChartShouldShowBidAskLines] = useChange(PERSISTENT, 'chartShouldShowBidAskLines');
  const [
    chartShouldShowBidAskLinesValue, setChartShouldShowBidAskLinesValue,
  ] = useState(chartShouldShowBidAskLines);

  const [chartEmaNumbers, setChartEmaNumbers] = useChange(PERSISTENT, 'chartEmaNumbers');
  const [chartEmaNumbersValue, setChartEmaNumbersValue] = useState(chartEmaNumbers);

  const [chartShouldShowEma, setChartShouldShowEma] = useChange(PERSISTENT, 'chartShouldShowEma');
  const [chartShouldShowEmaValue, setChartShouldShowEmaValue] = useState(chartShouldShowEma);

  const [chartEmaColors, setChartEmaColors] = useChange(PERSISTENT, 'chartEmaColors');
  const [chartEmaColorsValue, setChartEmaColorsValue] = useState(chartEmaColors);

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

    setChartEmaNumbers(chartEmaNumbersValue);
    setChartShouldShowEma(chartShouldShowEmaValue);
    setChartEmaColors(chartEmaColorsValue);
  }), [
    chartEmaColorsValue, chartEmaNumbersValue, chartOrdersNumber, chartOrdersNumberStr,
    chartPaddingBottomPercent, chartPaddingRightPercent, chartPaddingTopPercent,
    chartShouldShowBidAskLinesValue, chartShouldShowEmaValue, chartUpdateFrequency,
    chartUpdateFrequencyStr, listenSettingsSave, paddingBottomStr, paddingRightStr,
    paddingTopStr, setChartEmaColors, setChartEmaNumbers, setChartOrdersNumber,
    setChartPaddingBottomPercent, setChartPaddingRightPercent, setChartPaddingTopPercent,
    setChartShouldShowBidAskLines, setChartShouldShowEma, setChartUpdateFrequency,
  ]);

  useEffect(() => listenSettingsCancel(() => {
    setPaddingTopStr(String(chartPaddingTopPercent));
    setPaddingBottomStr(String(chartPaddingBottomPercent));
    setPaddingRightStr(String(chartPaddingRightPercent));
    setChartOrdersNumberStr(String(chartOrdersNumber));
    setChartUpdateFrequencyStr(String(chartUpdateFrequency));
    setChartShouldShowBidAskLinesValue(chartShouldShowBidAskLines);
    setChartEmaNumbersValue(chartEmaNumbers);
    setChartShouldShowEmaValue(chartShouldShowEma);
    setChartEmaColorsValue(chartEmaColors);
  }), [
    chartEmaColors, chartEmaNumbers, chartOrdersNumber, chartPaddingBottomPercent,
    chartPaddingRightPercent, chartPaddingTopPercent, chartShouldShowBidAskLines,
    chartShouldShowEma, chartUpdateFrequency, listenSettingsCancel,
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
        <Col xs={6} md={3}>
          <Label htmlFor="chartUpdateFrequency" className="form-label">Update frequency (ms)</Label>
          <Input
            type="number"
            id="chartUpdateFrequency"
            value={chartUpdateFrequencyStr}
            onChange={({ target }) => setChartUpdateFrequencyStr(target.value)}
          />
        </Col>
        <Col xs={6} md={3} className="pt-3">
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
      </Row>
      {chartShouldShowEmaValue.map((_v, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Row key={index} className="mt-3">
          <Col xs={4} className="pt-4 mt-2">
            <FormSwitch
              id={`shouldShowChartEma${index}`}
              isChecked={chartShouldShowEmaValue[index]}
              className="d-inline-block align-middle"
              onChange={(isChecked) => {
                setChartShouldShowEmaValue(
                  (v) => v.map((val, i) => (
                    i === index ? isChecked : val
                  )) as typeof chartShouldShowEmaValue,
                );
              }}
            />
            {' '}
            Show EMA
            {' '}
            {index + 1}
          </Col>
          <Col xs={4}>
            <Label htmlFor={`emaNumber${index}`}>
              EMA
              {' '}
              {index + 1}
              {' '}
              number
            </Label>
            <Input
              type="number"
              id={`emaNumber${index}`}
              value={chartEmaNumbersValue[index]}
              onChange={({ target }) => {
                setChartEmaNumbersValue(
                  (v) => v.map((val, i) => (
                    i === index ? +target.value : val
                  )) as typeof chartEmaNumbersValue,
                );
              }}
            />
          </Col>
          <Col xs={4}>
            <Label htmlFor={`emaColor${index}`}>
              EMA
              {' '}
              {index + 1}
              {' '}
              color
            </Label>
            <Input
              type="color"
              id={`emaColor${index}`}
              value={chartEmaColorsValue[index]}
              onChange={({ target }) => {
                setChartEmaColorsValue(
                  (v) => v.map((val, i) => (
                    i === index ? target.value : val
                  )) as typeof chartEmaColorsValue,
                );
              }}
            />
          </Col>
        </Row>
      ))}
    </>
  );
};

export default memo(ChartSettings);
