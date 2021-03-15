/* eslint-disable import/no-webpack-loader-syntax */
import bootstrap from '!raw-loader!bootstrap/dist/css/bootstrap.css';
import bootswatchDarkly from '!raw-loader!bootswatch/dist/darkly/bootstrap.css';

import defaultThemeStyle from '!raw-loader!../themes/defaultTheme.css';
import darkThemeStyle from '!raw-loader!../themes/darkTheme.css';

export const defaultTheme = bootstrap + defaultThemeStyle;
export const darkTheme = bootswatchDarkly + darkThemeStyle;
