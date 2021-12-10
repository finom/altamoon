import React, { ReactElement } from 'react';
import { renderRoutes } from 'react-router-config';
import { HashRouter } from 'react-router-dom';
import { Provider as UseChangeProvider } from 'use-change';
// eslint-disable-next-line import/no-webpack-loader-syntax
import '!style-loader!css-loader!noty/lib/noty.css';
// eslint-disable-next-line import/no-webpack-loader-syntax
import '!style-loader!css-loader!noty/lib/themes/mint.css';
// eslint-disable-next-line import/no-webpack-loader-syntax
import '!style-loader!css-loader!altamoon-minicharts/style.css';

import routes from './routes';
import ErrorBoundary from './ErrorBoundary';

import './root.global.css';
import store from '../store';

const Root = (): ReactElement => (
  <ErrorBoundary>
    <HashRouter>
      <UseChangeProvider value={store}>
        {renderRoutes(routes)}
      </UseChangeProvider>
    </HashRouter>
  </ErrorBoundary>
);

export default Root;
