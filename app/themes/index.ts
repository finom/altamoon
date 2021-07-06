/* eslint-disable import/no-webpack-loader-syntax */
import bootstrap from '!raw-loader!bootstrap/dist/css/bootstrap.css';
import bootswatchDarkly from '!raw-loader!bootswatch/dist/darkly/bootstrap.css';

import lightThemeStyle from '!raw-loader!./lightTheme.css';
import darkThemeStyle from '!raw-loader!./darkTheme.css';
import customStyle from '!raw-loader!./customStyle.css';

export const lightTheme = bootstrap + lightThemeStyle;
export const darkTheme = bootswatchDarkly + darkThemeStyle + customStyle;
