'use client';

import { useState } from 'react';
import { TemplateHeader } from '../components';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';

function EditEventContent() {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <>
      <TemplateHeader
        activeStep={activeStep}
        handleNext={handleNext}
        handleBack={handleBack}
      />
      {activeStep === 0 && <Step1 />}
      {activeStep === 1 && <Step2 />}
      {activeStep === 2 && <Step3 />}
    </>
  );
}

export default EditEventContent;
