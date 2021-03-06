import React, {
  memo, ReactElement, useEffect, useRef,
} from 'react';
import minichars from 'altamoon-minicharts';
import { useSet } from 'use-change';

import Widget from '../../layout/Widget';
import { PERSISTENT } from '../../../store';

const MinichartsWidget = ({ title, id }: { title: string; id: string; }): ReactElement => {
  const bodyRef = useRef<HTMLElement | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const alertLogRef = useRef<HTMLDivElement | null>(null);
  const setSymbol = useSet(PERSISTENT, 'symbol');

  useEffect(() => {
    if (bodyRef.current && alertLogRef.current && settingsRef.current) {
      minichars(bodyRef.current, {
        settingsContainer: settingsRef.current,
        alertLogContainer: alertLogRef.current,
        onSymbolSelect: setSymbol,
      });
    }
  }, [bodyRef, setSymbol, settingsRef, alertLogRef]);

  return (
    <>
      <div style={{ display: 'none' }}><div ref={settingsRef} /></div>
      <Widget
        id={id}
        title={title}
        bodyRef={bodyRef}
        settings={(
          <div
            ref={(element) => settingsRef.current && element?.appendChild(settingsRef.current)}
          />
        )}
        after={<div ref={alertLogRef} />}
        canSettingsSave={false}
      />
    </>
  );
};

export default memo(MinichartsWidget);
