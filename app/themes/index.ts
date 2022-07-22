/* eslint-disable import/no-webpack-loader-syntax */
import bootswatchDarkly from '!raw-loader!bootswatch/dist/darkly/bootstrap.css';
import darkThemeStyle from '!raw-loader!./darkTheme.css';

// eslint-disable-next-line import/prefer-default-export
export const darkTheme = bootswatchDarkly + darkThemeStyle;
