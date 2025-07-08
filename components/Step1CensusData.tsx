'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { CensusData, CityData } from '@/types/estimator'

interface Step1CensusDataProps {
  onComplete: (data: CensusData) => void
  data: CensusData | null
}

interface FormData {
  city: string
  state: string
  primaryRadius: number
  secondaryRadius: number
}

export default function Step1CensusData({ onComplete, data }: Step1CensusDataProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [censusResults, setCensusResults] = useState<CensusData | null>(data)
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      city: data?.city || '',
      state: data?.state || '',
      primaryRadius: data?.primaryRadius || 10,
      secondaryRadius: data?.secondaryRadius || 25
    }
  })

  const primaryRadius = watch('primaryRadius')
  const secondaryRadius = watch('secondaryRadius')

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/census-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch census data')
      }

      const result = await response.json()
      
      if (result.success) {
        setCensusResults(result.data)
        onComplete(result.data)
        toast.success('Census data retrieved successfully!')
      } else {
        throw new Error(result.message || 'Failed to retrieve census data')
      }
    } catch (error) {
      console.error('Error fetching census data:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to retrieve census data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">
          Step 1: Service Area & Census Data
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-secondary-700 mb-1">
                Target City *
              </label>
              <input
                {...register('city', { required: 'City is required' })}
                type="text"
                className="input-field"
                placeholder="Enter city name"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-secondary-700 mb-1">
                State (2-letter code) *
              </label>
              <input
                {...register('state', { 
                  required: 'State is required',
                  pattern: {
                    value: /^[A-Z]{2}$/,
                    message: 'Please enter a valid 2-letter state code (e.g., CA, NY)'
                  }
                })}
                type="text"
                className="input-field"
                placeholder="CA, NY, TX, etc."
                maxLength={2}
              />
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="primaryRadius" className="block text-sm font-medium text-secondary-700 mb-1">
                Primary Service Area Radius: {primaryRadius} miles
              </label>
              <input
                {...register('primaryRadius', { 
                  required: true,
                  min: { value: 1, message: 'Minimum 1 mile' },
                  max: { value: 15, message: 'Maximum 15 miles' }
                })}
                type="range"
                min="1"
                max="15"
                className="w-full"
              />
              {errors.primaryRadius && (
                <p className="text-red-500 text-sm mt-1">{errors.primaryRadius.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="secondaryRadius" className="block text-sm font-medium text-secondary-700 mb-1">
                Secondary Service Area Radius: {secondaryRadius} miles
              </label>
              <input
                {...register('secondaryRadius', { 
                  required: true,
                  min: { value: 10, message: 'Minimum 10 miles' },
                  max: { value: 25, message: 'Maximum 25 miles' }
                })}
                type="range"
                min="10"
                max="25"
                className="w-full"
              />
              {errors.secondaryRadius && (
                <p className="text-red-500 text-sm mt-1">{errors.secondaryRadius.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full md:w-auto"
          >
            {isLoading ? 'Retrieving Data...' : 'Get Census Data'}
          </button>
        </form>
      </div>

      {censusResults && (
        <div className="card">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">
            Census Data Results
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Population
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Single-Family Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Multi-Family Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Commercial Units (Est.)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Total Units
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {censusResults.citiesInPrimaryRadius.map((city, index) => (
                  <tr key={`primary-${index}`} className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                      {city.name}, {city.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formatNumber(city.population)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formatNumber(city.singleFamilyUnits)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formatNumber(city.multiFamilyUnits)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formatNumber(city.commercialUnits)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formatNumber(city.totalHousingUnits)}
                    </td>
                  </tr>
                ))}
                {censusResults.citiesInSecondaryRadius.map((city, index) => (
                  <tr key={`secondary-${index}`} className="bg-green-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                      {city.name}, {city.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formatNumber(city.population)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formatNumber(city.singleFamilyUnits)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formatNumber(city.multiFamilyUnits)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formatNumber(city.commercialUnits)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formatNumber(city.totalHousingUnits)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
            <h4 className="font-semibold text-secondary-900 mb-2">Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Cities:</span> {censusResults.citiesInPrimaryRadius.length + censusResults.citiesInSecondaryRadius.length}
              </div>
              <div>
                <span className="font-medium">Total Population:</span> {formatNumber(censusResults.population)}
              </div>
              <div>
                <span className="font-medium">Total Housing Units:</span> {formatNumber(censusResults.totalHousingUnits)}
              </div>
              <div>
                <span className="font-medium">Commercial Units (Est.):</span> {formatNumber(censusResults.commercialUnits)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 