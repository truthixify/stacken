import React from 'react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
}

const ProgressSteps: React.FC<Props> = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'border-gray-300 text-gray-500'
            }`}>
              {step.number}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;