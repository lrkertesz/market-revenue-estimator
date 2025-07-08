'use client'

interface StepIndicatorProps {
  currentStep: number
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, title: 'Census Data', description: 'Get housing data' },
    { number: 2, title: 'Industry Select', description: 'Choose services' },
    { number: 3, title: 'Map View', description: 'Visualize service area' },
    { number: 4, title: 'Report', description: 'Generate summary' }
  ]

  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number
          const isCompleted = currentStep > step.number
          const isLast = index === steps.length - 1

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`step-indicator ${
                    isActive
                      ? 'active'
                      : isCompleted
                      ? 'completed'
                      : 'pending'
                  }`}
                >
                  {isCompleted ? '✓' : step.number}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    isActive ? 'text-primary-600' : 'text-secondary-600'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-secondary-500">
                    {step.description}
                  </div>
                </div>
              </div>
              
              {!isLast && (
                <div className={`w-16 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-secondary-300'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 