import React, { memo, ReactElement } from 'react';
import { WidgetSettingsProps } from '../../../layout/Widget';
import GeneralSettings from './GeneralSettings';
import EmaSettings from './EmaSettings';
import SupertrendSettings from './SupertrendSettings';

const ChartSettings = ({
  listenSettingsCancel, listenSettingsSave,
}: WidgetSettingsProps): ReactElement => (
  <>
    <GeneralSettings
      listenSettingsCancel={listenSettingsCancel}
      listenSettingsSave={listenSettingsSave}
    />
    <EmaSettings
      listenSettingsCancel={listenSettingsCancel}
      listenSettingsSave={listenSettingsSave}
    />
    <SupertrendSettings
      listenSettingsCancel={listenSettingsCancel}
      listenSettingsSave={listenSettingsSave}
    />
  </>
);

export default memo(ChartSettings);
