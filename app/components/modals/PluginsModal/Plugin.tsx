import React, { ReactElement } from 'react';
import {
  Card, CardBody, Badge, Button,
} from 'reactstrap';
import tooltipRef from '../../../lib/tooltipRef';
import FormSwitch from '../../controls/FormSwitch';

import css from './style.css';

interface Props {
  id: string;
  name: string;
  version: string | null;
  description: string;
  isDefault: boolean;
  isEnabled: boolean;
  isThirdParty: boolean;
  isDevelopment: boolean;

  onEnablePlugin: (id: string) => void;
  onDisablePlugin: (id: string, shouldNotifyReload: boolean) => void;
}

const Plugin = ({
  id, name, isThirdParty, description, version, isDefault,
  isDevelopment, isEnabled, onEnablePlugin, onDisablePlugin,
}: Props): ReactElement => (
  <Card className={`mb-3 ${css.plugin}`}>
    <CardBody>
      <div className="mb-1">
        {version ? (
          <a className="mr-1 d-inline-block" href={`https://npmjs.com/package/${name}`} target="_blank" rel="noreferrer">{name}</a>
        ) : (
          <strong className="mr-1 d-inline-block">{name}</strong>
        )}
        {!!version && (
          <span className="text-muted ms-2 d-inline-block">
            v
            {version}
          </span>
        )}
        {(!!isThirdParty || isDevelopment) && (
          <Badge
            className="bg-warning cursor-help ms-2"
            innerRef={tooltipRef({
              title: 'The plugin is made by third-party developers but not by the Biduul team',
            })}
          >
            <em>Third-party</em>
          </Badge>
        )}
        {' '}

        {isDefault ? (
          <FormSwitch
            className="float-end"
            isChecked={isEnabled}
            onChange={(isChecked) => (
              isChecked ? onEnablePlugin(id) : onDisablePlugin(id, isDefault && !isThirdParty)
            )}
          />
        ) : (
          <Button
            color="primary"
            size="sm"
            className="float-end py-0"
            onClick={() => onDisablePlugin(id, isDefault && !isThirdParty)}
          >
            Remove
          </Button>
        )}
      </div>
      <div>{description}</div>
    </CardBody>
  </Card>
);

export default Plugin;
