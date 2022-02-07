/* eslint-disable react/jsx-props-no-spreading */
import { pick } from 'lodash';
import React, {
  Dispatch, ReactElement, SetStateAction, useCallback, useEffect, useMemo,
} from 'react';
import { Download } from 'react-bootstrap-icons';
import { useDropzone } from 'react-dropzone';
import { Button } from 'reactstrap';
import { useGet } from 'use-change';
import { ROOT, RootStore } from '../../../store';

export interface SettingsFileObject {
  fileType: 'altamoon-settings';
  settings: RootStore['persistent'];
  minichartsSettings: Partial<RootStore['minicharts']>;
}

interface Props {
  isSettingsModalOpen: boolean;
  setingsFileObject: SettingsFileObject;
  setSettingsFileObject: Dispatch<SetStateAction<SettingsFileObject | null>>
}

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#25232316',
  borderStyle: 'dashed',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const activeStyle = {
  borderColor: '#2196f370',
};

const acceptStyle = {
  borderColor: '#00e67670',
};

const rejectStyle = {
  borderColor: '#ff174470',
};

const ExportImport = ({
  isSettingsModalOpen, setingsFileObject, setSettingsFileObject,
}: Props): ReactElement => {
  const getSettings = useGet(ROOT, 'persistent');
  const getMinicharts = useGet(ROOT, 'minicharts');
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const object = JSON.parse(fileReader.result as string) as SettingsFileObject;
      setSettingsFileObject(object);
    };

    fileReader.readAsText(acceptedFiles[0]);
  }, [setSettingsFileObject]);
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    inputRef: fileInputRef,
  } = useDropzone({
    accept: 'application/json',
    maxFiles: 1,
    onDrop,
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {}),
  }), [
    isDragActive,
    isDragReject,
    isDragAccept,
  ]);

  // reset on close
  useEffect(() => {
    if (fileInputRef.current && !isSettingsModalOpen) {
      fileInputRef.current.value = '';
      setSettingsFileObject(null);
    }
  }, [fileInputRef, isSettingsModalOpen, setSettingsFileObject]);

  return (
    <>
      <div {...getRootProps({ style })} className="mt-2 mb-1">
        <input {...getInputProps()} />
        {isDragActive && <p className="m-0">Drop the files here ...</p>}
        {!isDragActive && !setingsFileObject && <p className="m-0">Drag&apos;n&apos;drop a settings file here, or click to select it.</p>}
        {!isDragActive && !!setingsFileObject && setingsFileObject.fileType !== 'altamoon-settings' && (
          <p className="m-0 text-warning">Settings file is invalid. Please select another file.</p>
        )}
        {!isDragActive && !!setingsFileObject && setingsFileObject.fileType === 'altamoon-settings' && (
          <p className="m-0 text-success">Settings file is valid.</p>
        )}
      </div>
      <Button
        color="secondary"
        size="sm"
        onClick={() => {
          const a = document.createElement('a');
          const settingsObject: SettingsFileObject = {
            fileType: 'altamoon-settings',
            settings: getSettings(),
            minichartsSettings: pick(getMinicharts(), ['chartHeight', 'interval', 'maxChartsLength', 'throttleDelay', 'gridColumns', 'chartType', 'scaleType', 'sortBy', 'sortDirection']),
          };
          const blob = new Blob([JSON.stringify(settingsObject, null, '\t')], { type: 'application/json' });
          a.href = window.URL.createObjectURL(blob);
          a.download = 'altamoon-settings.json';
          a.click();
        }}
      >

        <Download />
        {' '}
        Download settings
      </Button>
    </>
  );
};

export default ExportImport;
