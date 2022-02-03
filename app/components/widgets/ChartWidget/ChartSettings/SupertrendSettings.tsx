import React, {
  memo, ReactElement, useEffect, useState,
} from 'react';
import {
  Col, Input, Label, Row,
} from 'reactstrap';
import useChange from 'use-change';
import { PERSISTENT } from '../../../../store';
import FormSwitch from '../../../controls/FormSwitch';
import { WidgetSettingsProps } from '../../../layout/Widget';

const SupertrendSettings = ({
  listenSettingsCancel, listenSettingsSave,
}: WidgetSettingsProps): ReactElement => {
  const [shouldShow, setShouldShow] = useChange(PERSISTENT, 'chartShouldShowSupertrend');
  const [shouldShowValue, setShouldShowValue] = useState(shouldShow);

  const [period, setPeriod] = useChange(PERSISTENT, 'chartSupertrendPeroid');
  const [periodValue, setPeriodValue] = useState(String(period));

  const [multiplier, setMultiplier] = useChange(PERSISTENT, 'chartSupertrendMultiplier');
  const [multiplierValue, setMultiplierValue] = useState(String(multiplier));

  const [downTrendColor, setDownTrendColor] = useChange(PERSISTENT, 'chartSupertrendDownTrendColor');
  const [downTrendColorValue, setDownTrendColorValue] = useState(downTrendColor);

  const [upTrendColor, setUpTrendColor] = useChange(PERSISTENT, 'chartSupertrendUpTrendColor');
  const [upTrendColorValue, setUpTrendColorValue] = useState(upTrendColor);

  useEffect(() => listenSettingsSave(() => {
    setShouldShow(shouldShowValue);
    setPeriod(+periodValue || 0);
    setMultiplier(+multiplierValue || 0);
    setDownTrendColor(downTrendColorValue);
    setUpTrendColor(upTrendColorValue);

    setPeriodValue(String(+periodValue || 0));
    setMultiplierValue(String(+multiplierValue || 0));
  }), [
    downTrendColorValue, listenSettingsSave, multiplierValue, period, periodValue,
    setDownTrendColor, setMultiplier, setPeriod, setShouldShow, setUpTrendColor,
    shouldShowValue, upTrendColorValue,
  ]);

  useEffect(() => listenSettingsCancel(() => {
    setShouldShowValue(shouldShow);
    setPeriodValue(String(period));
    setMultiplierValue(String(multiplier));
    setDownTrendColorValue(downTrendColor);
    setUpTrendColorValue(upTrendColor);
  }), [downTrendColor, listenSettingsCancel, multiplier, period, shouldShow, upTrendColor]);

  return (
    <Row className="mt-3">
      <Col xs={4} className="pt-4 mt-2">
        <FormSwitch
          id="shouldShowSupertrend"
          isChecked={shouldShowValue}
          className="d-inline-block align-middle"
          onChange={(isChecked) => {
            setShouldShowValue(isChecked);
          }}
        />
        {' '}
        Show Supertrend
      </Col>
      <Col xs={8}>
        <Row>
          <Col xs={3}>
            <Label htmlFor="supertrendPeriod">
              Supertrend period
            </Label>
            <Input
              type="number"
              id="supertrendPeriod"
              value={periodValue}
              onChange={({ target }) => {
                setPeriodValue(target.value);
              }}
            />
          </Col>
          <Col xs={3}>
            <Label htmlFor="supertrendMultiplier">
              Supertrend multiplier
            </Label>
            <Input
              type="number"
              id="supertrendMultiplier"
              value={multiplierValue}
              onChange={({ target }) => {
                setMultiplierValue(target.value);
              }}
            />
          </Col>
          <Col xs={3}>
            <Label htmlFor="supertrendUpTrendColor">
              Uptrend color
            </Label>
            <Input
              type="color"
              id="supertrendUpTrendColor"
              value={upTrendColorValue}
              onChange={({ target }) => {
                setUpTrendColorValue(target.value);
              }}
            />
          </Col>
          <Col xs={3}>
            <Label htmlFor="supertrendDownTrendColor">
              Downtrend color
            </Label>
            <Input
              type="color"
              id="supertrendDownTrendColor"
              value={downTrendColorValue}
              onChange={({ target }) => {
                setDownTrendColorValue(target.value);
              }}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default memo(SupertrendSettings);
