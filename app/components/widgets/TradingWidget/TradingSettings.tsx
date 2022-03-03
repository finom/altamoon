import { mapValues, times } from 'lodash';
import React, { ReactElement, useEffect, useState } from 'react';
import {
  Button, Col, Input, Row,
} from 'reactstrap';
import useChange from 'use-change';
import { PERSISTENT } from '../../../store';
import { WidgetSettingsProps } from '../../layout/Widget/WidgetSettingsModal';

import css from './style.css';

const TradingSettings = ({
  listenSettingsCancel, listenSettingsSave,
}: WidgetSettingsProps): ReactElement => {
  const [buttonsCount, setButtonsCount] = useChange(PERSISTENT, 'tradingWidgetPercentButtonsCount');
  const [buttonsCountTmp, setButtonsCountTmp] = useState(buttonsCount);
  const [buttonsLayouts, setButtonsLayouts] = useChange(PERSISTENT, 'tradingWidgetPercentButtonsLayouts');
  // eslint-disable-next-line no-spaced-func, max-len
  const [buttonsLayoutsTmp, setButtonsLayoutsTmp] = useState<Record<number, (number | string)[]>>(buttonsLayouts);
  const buttonLayout = buttonsLayoutsTmp[buttonsCountTmp];

  useEffect(() => listenSettingsCancel(() => {
    setButtonsCountTmp(buttonsCount);
    setButtonsLayoutsTmp(buttonsLayouts);
  }), [buttonsCount, buttonsLayouts, listenSettingsCancel]);

  useEffect(() => listenSettingsSave(() => {
    setButtonsCount(buttonsCountTmp);
    setButtonsLayouts(
      mapValues(buttonsLayoutsTmp, (layout) => layout.map((percent) => +percent || 0)),
    );
  }), [buttonsCountTmp, buttonsLayoutsTmp, listenSettingsSave, setButtonsCount, setButtonsLayouts]);

  return (
    <>
      <label htmlFor="quick_order_layout_input" className="mb-1">Quick order layout</label>
      <Input
        type="select"
        id="quick_order_layout_input"
        className="mb-2"
        value={buttonsCountTmp}
        onChange={({ target }) => setButtonsCountTmp(+target.value)}
      >
        <option value="4">4 buttons</option>
        <option value="6">6 buttons</option>
      </Input>
      <Row className={css.quickOrderWrapper}>
        {times(buttonsCountTmp).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Col key={index} xs={12 / buttonsCountTmp}>
            <Button className="w-100 nowrap mb-1 px-0">
              <input
                className={css.quickOrderSettingsButtonInput}
                value={buttonLayout[index] ?? ''}
                onChange={({ target }) => {
                  const newLayout = [...buttonLayout];
                  newLayout[index] = target.value;
                  setButtonsLayoutsTmp((layouts) => ({
                    ...layouts,
                    [buttonsCountTmp]: newLayout,
                  }));
                }}
              />
              %
            </Button>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default TradingSettings;
