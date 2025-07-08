'use client'

import { useState } from 'react'
import Step1CensusData from '@/components/Step1CensusData'
import Step2IndustrySelect from '@/components/Step2IndustrySelect'
import Step3Map from '@/components/Step3Map'
import Step4Report from '@/components/Step4Report'
import StepIndicator from '@/components/StepIndicator'
import { EstimatorData } from '@/types/estimator'

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)
  const [estimatorData, setEstimatorData] = useState<EstimatorData>({
    step1: null,
    step2: null,
    step3: null,
    step4: null
  })

  const handleStepComplete = (step: number, data: any) => {
    setEstimatorData(prev => ({
      ...prev,
      [`step${step}`]: data
    }))
    if (step < 4) {
      setCurrentStep(step + 1)
    }
  }

  const handleStepBack = (step: number) => {
    setCurrentStep(step)
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1CensusData
            onComplete={(data) => handleStepComplete(1, data)}
            data={estimatorData.step1}
          />
        )
      case 2:
        return (
          <Step2IndustrySelect
            onComplete={(data) => handleStepComplete(2, data)}
            onBack={() => handleStepBack(1)}
            step1Data={estimatorData.step1}
            data={estimatorData.step2}
          />
        )
      case 3:
        return (
          <Step3Map
            onComplete={(data) => handleStepComplete(3, data)}
            onBack={() => handleStepBack(2)}
            step1Data={estimatorData.step1}
            step2Data={estimatorData.step2}
            data={estimatorData.step3}
          />
        )
      case 4:
        return (
          <Step4Report
            onBack={() => handleStepBack(3)}
            step1Data={estimatorData.step1}
            step2Data={estimatorData.step2}
            step3Data={estimatorData.step3}
            data={estimatorData.step4}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 mb-2">
            Market Revenue Estimator
          </h1>
          <p className="text-secondary-600 text-lg">
            Estimate annual revenue potential for local service businesses
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  )
} 