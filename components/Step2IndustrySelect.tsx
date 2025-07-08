'use client'

import { useState } from 'react'
import { CensusData, IndustryData, ServiceJob, SanityCheckData } from '@/types/estimator'

interface Step2IndustrySelectProps {
  onComplete: (data: IndustryData) => void
  onBack: () => void
  step1Data: CensusData | null
  data: IndustryData | null
}

const HVAC_SERVICES = [
  {
    name: 'Filter Replacement',
    lifecycle: '1-3 months',
    singleFamilyCost: { min: 25, max: 50 },
    multiFamilyCost: { min: 30, max: 75 },
    commercialCost: { min: 50, max: 150 }
  },
  {
    name: 'Coil Cleaning',
    lifecycle: 'Annually',
    singleFamilyCost: { min: 45, max: 350 },
    multiFamilyCost: { min: 100, max: 500 },
    commercialCost: { min: 200, max: 800 }
  },
  {
    name: 'Drain Line Cleaning',
    lifecycle: 'Annually',
    singleFamilyCost: { min: 75, max: 200 },
    multiFamilyCost: { min: 150, max: 400 },
    commercialCost: { min: 300, max: 800 }
  },
  {
    name: 'System Tune-up',
    lifecycle: 'Annually',
    singleFamilyCost: { min: 70, max: 200 },
    multiFamilyCost: { min: 200, max: 500 },
    commercialCost: { min: 400, max: 1000 }
  },
  {
    name: 'Refrigerant Recharge',
    lifecycle: '2-3 years',
    singleFamilyCost: { min: 100, max: 500 },
    multiFamilyCost: { min: 300, max: 800 },
    commercialCost: { min: 500, max: 1500 }
  },
  {
    name: 'Duct Cleaning',
    lifecycle: '3-5 years',
    singleFamilyCost: { min: 250, max: 1000 },
    multiFamilyCost: { min: 500, max: 2000 },
    commercialCost: { min: 1000, max: 5000 }
  },
  {
    name: 'Electrical Component Check',
    lifecycle: 'Annually',
    singleFamilyCost: { min: 100, max: 250 },
    multiFamilyCost: { min: 200, max: 600 },
    commercialCost: { min: 500, max: 1200 }
  },
  {
    name: 'Motor Lubrication',
    lifecycle: 'Annually',
    singleFamilyCost: { min: 50, max: 150 },
    multiFamilyCost: { min: 100, max: 300 },
    commercialCost: { min: 200, max: 600 }
  }
]

const CLIMATE_ZONES = {
  'Hot-Humid': { states: ['FL', 'TX', 'LA'], hvacAdoption: 0.92 },
  'Hot-Dry': { states: ['AZ', 'NV', 'NM'], hvacAdoption: 0.88 },
  'Mixed-Humid': { states: ['GA', 'NC', 'SC'], hvacAdoption: 0.83 },
  'Mixed-Dry': { states: ['CA', 'CO', 'UT'], hvacAdoption: 0.78 },
  'Cold': { states: ['MN', 'WI', 'MI'], hvacAdoption: 0.88 },
  'Very Cold': { states: ['ND', 'MT', 'ME'], hvacAdoption: 0.83 },
  'Marine': { states: ['WA', 'OR'], hvacAdoption: 0.68 }
}

export default function Step2IndustrySelect({ onComplete, onBack, step1Data, data }: Step2IndustrySelectProps) {
  const [selectedIndustry, setSelectedIndustry] = useState(data?.industry || 'hvac')
  const [isCalculating, setIsCalculating] = useState(false)
  const [results, setResults] = useState<IndustryData | null>(data)

  const getClimateZone = (state: string) => {
    for (const [zone, data] of Object.entries(CLIMATE_ZONES)) {
      if (data.states.includes(state)) {
        return { zone, adoption: data.hvacAdoption }
      }
    }
    return { zone: 'Unknown', adoption: 0.75 } // Default fallback
  }

  const calculateRevenue = async () => {
    if (!step1Data) {
      alert('Please complete Step 1 first')
      return
    }

    setIsCalculating(true)

    try {
      const climateZone = getClimateZone(step1Data.state)
      
      // Calculate revenue for each service
      const services: ServiceJob[] = HVAC_SERVICES.map(service => {
        const totalSingleFamily = step1Data.citiesInPrimaryRadius.reduce((sum, city) => 
          sum + city.singleFamilyUnits, 0) + 
          step1Data.citiesInSecondaryRadius.reduce((sum, city) => 
          sum + city.singleFamilyUnits, 0)

        const totalMultiFamily = step1Data.citiesInPrimaryRadius.reduce((sum, city) => 
          sum + city.multiFamilyUnits, 0) + 
          step1Data.citiesInSecondaryRadius.reduce((sum, city) => 
          sum + city.multiFamilyUnits, 0)

        const totalCommercial = step1Data.citiesInPrimaryRadius.reduce((sum, city) => 
          sum + city.commercialUnits, 0) + 
          step1Data.citiesInSecondaryRadius.reduce((sum, city) => 
          sum + city.commercialUnits, 0)

        // Apply climate zone adoption rate
        const adjustedSingleFamily = Math.floor(totalSingleFamily * climateZone.adoption)
        const adjustedMultiFamily = Math.floor(totalMultiFamily * climateZone.adoption)
        const adjustedCommercial = Math.floor(totalCommercial * climateZone.adoption)

        // Calculate lifecycle frequency (jobs per year)
        let jobsPerYear = 0
        if (service.lifecycle.includes('months')) {
          const months = parseInt(service.lifecycle.split('-')[0])
          jobsPerYear = 12 / months
        } else if (service.lifecycle === 'Annually') {
          jobsPerYear = 1
        } else if (service.lifecycle.includes('years')) {
          const years = parseInt(service.lifecycle.split('-')[0])
          jobsPerYear = 1 / years
        }

        const estimatedJobs = Math.floor(
          (adjustedSingleFamily + adjustedMultiFamily + adjustedCommercial) * jobsPerYear
        )

        const avgSingleFamilyCost = (service.singleFamilyCost.min + service.singleFamilyCost.max) / 2
        const avgMultiFamilyCost = (service.multiFamilyCost.min + service.multiFamilyCost.max) / 2
        const avgCommercialCost = (service.commercialCost.min + service.commercialCost.max) / 2

        const estimatedRevenue = Math.floor(
          (adjustedSingleFamily * avgSingleFamilyCost + 
           adjustedMultiFamily * avgMultiFamilyCost + 
           adjustedCommercial * avgCommercialCost) * jobsPerYear
        )

        return {
          ...service,
          estimatedJobs,
          estimatedRevenue
        }
      })

      const totalRevenue = services.reduce((sum, service) => sum + service.estimatedRevenue, 0)

      // Sanity check calculation
      const sanityCheck: SanityCheckData = {
        method: 'Population-based estimation',
        description: `Based on ${step1Data.population.toLocaleString()} population with ${climateZone.adoption * 100}% HVAC adoption rate`,
        estimatedRevenue: Math.floor(step1Data.population * climateZone.adoption * 0.15 * 500), // $500 avg per person per year
        confidence: 'High'
      }

      const industryData: IndustryData = {
        industry: selectedIndustry,
        services,
        totalRevenue,
        marketPenetration: climateZone.adoption * 100,
        revenueByCity: [], // Will be populated with detailed city breakdown
        sanityCheck
      }

      setResults(industryData)
      onComplete(industryData)
    } catch (error) {
      console.error('Error calculating revenue:', error)
      alert('Error calculating revenue. Please try again.')
    } finally {
      setIsCalculating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-secondary-900">
            Step 2: Select Industry & Calculate Revenue
          </h2>
          <button onClick={onBack} className="btn-secondary">
            ← Back to Step 1
          </button>
        </div>

        {step1Data && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Step 1 Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Target City:</span> {step1Data.city}, {step1Data.state}
              </div>
              <div>
                <span className="font-medium">Total Population:</span> {step1Data.population.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Total Housing Units:</span> {step1Data.totalHousingUnits.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Service Areas:</span> {step1Data.primaryRadius}mi / {step1Data.secondaryRadius}mi
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Select Industry
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="input-field"
            >
              <option value="hvac">HVAC Services</option>
              <option value="plumbing">Plumbing Services</option>
              <option value="electrical">Electrical Services</option>
              <option value="landscaping">Landscaping Services</option>
              <option value="cleaning">Cleaning Services</option>
            </select>
          </div>

          <button
            onClick={calculateRevenue}
            disabled={isCalculating || !step1Data}
            className="btn-primary"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Revenue Potential'}
          </button>
        </div>
      </div>

      {results && (
        <div className="card">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">
            Revenue Calculation Results
          </h3>

          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Total Revenue Potential</h4>
            <div className="text-3xl font-bold text-green-700">
              {formatCurrency(results.totalRevenue)}
            </div>
            <p className="text-sm text-green-600 mt-1">
              Market penetration: {results.marketPenetration.toFixed(1)}%
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Lifecycle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Estimated Jobs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Revenue Potential
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {results.services.map((service, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                      {service.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {service.lifecycle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {service.estimatedJobs.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                      {formatCurrency(service.estimatedRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">Sanity Check</h4>
            <p className="text-sm text-yellow-800 mb-2">{results.sanityCheck.description}</p>
            <div className="text-lg font-semibold text-yellow-700">
              Alternative Estimate: {formatCurrency(results.sanityCheck.estimatedRevenue)}
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              Confidence: {results.sanityCheck.confidence}
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 