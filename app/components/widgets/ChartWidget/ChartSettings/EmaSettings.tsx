import React, {
  memo, ReactElement, useEffect, useState,
} from 'react';
import {
  Col, Input, Label, Row,
} from 'reactstrap';
import useChange from 'use-change';

import { PERSISTENT } from '../../../../store';
import FormSwitch from '../../../controls/FormSwitch';
import { WidgetSettingsProps } from '../../../layout/Widget/WidgetSettingsModal';

const EmaSettings = ({
  listenSettingsCancel, listenSettingsSave,
}: WidgetSettingsProps): ReactElement => {
  const [chartEmaNumbers, setChartEmaNumbers] = useChange(PERSISTENT, 'chartEmaNumbers');
  const [chartEmaNumbersValue, setChartEmaNumbersValue] = useState(chartEmaNumbers.map(String));

  const [chartShouldShowEma, setChartShouldShowEma] = useChange(PERSISTENT, 'chartShouldShowEma');
  const [chartShouldShowEmaValue, setChartShouldShowEmaValue] = useState(chartShouldShowEma);

  const [chartEmaColors, setChartEmaColors] = useChange(PERSISTENT, 'chartEmaColors');
  const [chartEmaColorsValue, setChartEmaColorsValue] = useState(chartEmaColors);

  useEffect(() => listenSettingsSave(() => {
    setChartEmaNumbers(chartEmaNumbersValue.map((v) => +v || 0) as typeof chartEmaNumbers);
    setChartShouldShowEma(chartShouldShowEmaValue);
    setChartEmaColors(chartEmaColorsValue);
    setChartEmaNumbersValue(chartEmaNumbersValue.map((v) => String(+v || 0)));
  }), [
    chartEmaColorsValue, chartEmaNumbersValue, chartShouldShowEmaValue, listenSettingsSave,
    setChartEmaColors, setChartEmaNumbers, setChartShouldShowEma,
  ]);

  useEffect(() => listenSettingsCancel(() => {
    setChartEmaNumbersValue(chartEmaNumbers.map(String));
    setChartShouldShowEmaValue(chartShouldShowEma);
    setChartEmaColorsValue(chartEmaColors);
  }), [chartEmaColors, chartEmaNumbers, chartShouldShowEma, listenSettingsCancel]);

  return (
    <>
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
                    i === index ? target.value : val
                  )),
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

export default memo(EmaSettings);
