import React, { ReactElement } from 'react';
import { RouteConfig } from 'react-router-config';
import { Link } from 'react-router-dom';

const Foo = (): ReactElement => (
  <div>
    <h1>This is Foo</h1>
    <Link to="/bar" replace>bar</Link>
  </div>
);

const Bar = (): ReactElement => (
  <div>
    <h1>This is Bar</h1>
    <Link to="/" replace>foo</Link>
  </div>
);

const routes: RouteConfig[] = [
  { path: '/', exact: true, component: Foo },
  { path: '/bar', component: Bar },
];

export default routes;
