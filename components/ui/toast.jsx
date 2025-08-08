// components/CustomToast.jsx

import {
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiInformationFill,
} from '@remixicon/react';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';

const iconMap = {
  success: <RiCheckboxCircleFill />,
  error: <RiErrorWarningFill />,
  warning: <RiErrorWarningFill />,
  info: <RiInformationFill />,
};

export default function CustomToast({ message, type = 'info' }) {
  return (
    <Alert variant="mono" icon={type}>
      <AlertIcon>{iconMap[type]}</AlertIcon>
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
}
