import React, { ReactElement, useCallback } from 'react';
import { WidthProvider, Responsive, Layout } from 'react-grid-layout';
import { SettingsModal } from '../components';
import useChange, { useSet } from '../hooks/useChange';
import { RootStore } from '../lib/store';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const style = { background: 'red' };

const FeatureTradingScreen = (): ReactElement => {
  const [layout, setLayout] = useChange(({ persistent }: RootStore) => persistent, 'layout');
  const setIsSettingsModalOpen = useSet((store: RootStore) => store, 'isSettingsModalOpen');

  const onLayoutChange = useCallback((changedLayout: Layout[] /* , changedLayouts: Layouts */) => {
    setLayout(changedLayout);
  }, [setLayout]);

  const onResetLayout = useCallback(() => {
    setLayout([]);
  }, [setLayout]);

  return (
    <div>
      <SettingsModal />
      <button type="button" onClick={onResetLayout}>Reset Layout</button>
      <button type="button" onClick={() => setIsSettingsModalOpen(true)}>Open settigns</button>
      <ResponsiveReactGridLayout
        className="layout"
        breakpoints={{
          lg: 100, md: 0, sm: 0, xs: 0, xxs: 0,
        }}
        cols={{
          lg: 12, md: 12, sm: 12, xs: 12, xxs: 12,
        }}
        rowHeight={30}
        layouts={{ lg: layout }}
        onLayoutChange={onLayoutChange}
      >
        <div
          key="1"
          data-grid={{
            w: 2, h: 3, x: 0, y: 0, minW: 2, minH: 3,
          }}
          style={style}
        >
          <span className="text">1</span>
        </div>
        <div
          key="2"
          data-grid={{
            w: 2, h: 3, x: 2, y: 0, minW: 2, minH: 3,
          }}
          style={style}
        >
          <span className="text">2</span>
        </div>
        <div
          key="3"
          data-grid={{
            w: 2, h: 3, x: 4, y: 0, minW: 2, minH: 3,
          }}
          style={style}
        >
          <span className="text">3</span>
        </div>
        <div
          key="4"
          data-grid={{
            w: 2, h: 3, x: 6, y: 0, minW: 2, minH: 3,
          }}
          style={style}
        >
          <span className="text">4</span>
        </div>
        <div
          key="5"
          data-grid={{
            w: 2, h: 3, x: 8, y: 0, minW: 2, minH: 3,
          }}
          style={style}
        >
          <span className="text">5</span>
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
};

export default FeatureTradingScreen;
