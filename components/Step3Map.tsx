'use client'

import { useState, useEffect } from 'react'
import { CensusData, IndustryData, MapData } from '@/types/estimator'

interface Step3MapProps {
  onComplete: (data: MapData) => void
  onBack: () => void
  step1Data: CensusData | null
  step2Data: IndustryData | null
  data: MapData | null
}

export default function Step3Map({ onComplete, onBack, step1Data, step2Data, data }: Step3MapProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [mapData, setMapData] = useState<MapData | null>(data)

  useEffect(() => {
    if (step1Data && !mapData) {
      generateMap()
    }
  }, [step1Data])

  const generateMap = async () => {
    if (!step1Data) return

    setIsLoading(true)

    try {
      // For now, we'll create a simple map data structure
      // In a real implementation, this would use Google Maps API
      const center = step1Data.citiesInPrimaryRadius[0]?.coordinates || {
        lat: 37.7749,
        lng: -122.4194
      }

      const mapData: MapData = {
        center,
        primaryRadius: step1Data.primaryRadius,
        secondaryRadius: step1Data.secondaryRadius,
        cities: [
          ...step1Data.citiesInPrimaryRadius,
          ...step1Data.citiesInSecondaryRadius
        ]
      }

      setMapData(mapData)
      onComplete(mapData)
    } catch (error) {
      console.error('Error generating map:', error)
    } finally {
      setIsLoading(false)
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
            Step 3: Service Area Map
          </h2>
          <button onClick={onBack} className="btn-secondary">
            ← Back to Step 2
          </button>
        </div>

        {step1Data && step2Data && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Previous Steps Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Target City:</span> {step1Data.city}, {step1Data.state}
              </div>
              <div>
                <span className="font-medium">Total Revenue:</span> {formatCurrency(step2Data.totalRevenue)}
              </div>
              <div>
                <span className="font-medium">Cities in Service Area:</span> {step1Data.citiesInPrimaryRadius.length + step1Data.citiesInSecondaryRadius.length}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-secondary-100 p-4 rounded-lg">
            <h3 className="font-semibold text-secondary-900 mb-2">Service Area Visualization</h3>
            <p className="text-secondary-600 text-sm">
              This map shows your primary service area ({step1Data?.primaryRadius} miles) and secondary service area ({step1Data?.secondaryRadius} miles) around {step1Data?.city}, {step1Data?.state}.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-secondary-600">Generating map...</span>
            </div>
          ) : mapData ? (
            <div className="space-y-4">
              {/* Map placeholder - in real implementation, this would be Google Maps */}
              <div className="bg-secondary-200 h-96 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-xl font-semibold text-secondary-700 mb-2">
                    Service Area Map
                  </h3>
                  <p className="text-secondary-600">
                    Interactive map showing {mapData.cities.length} cities in your service area
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-secondary-600">
                    <div>📍 Primary Service Area: {step1Data?.primaryRadius} mile radius</div>
                    <div>📍 Secondary Service Area: {step1Data?.secondaryRadius} mile radius</div>
                    <div>🏙️ Cities in Primary Area: {step1Data?.citiesInPrimaryRadius.length}</div>
                    <div>🏙️ Cities in Secondary Area: {step1Data?.citiesInSecondaryRadius.length}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card">
                  <h4 className="font-semibold text-secondary-900 mb-3">Primary Service Area</h4>
                  <div className="space-y-2">
                    {step1Data?.citiesInPrimaryRadius.slice(0, 5).map((city, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-secondary-700">{city.name}, {city.state}</span>
                        <span className="text-secondary-500">{city.population.toLocaleString()}</span>
                      </div>
                    ))}
                    {step1Data && step1Data.citiesInPrimaryRadius.length > 5 && (
                      <div className="text-xs text-secondary-500 italic">
                        +{step1Data.citiesInPrimaryRadius.length - 5} more cities
                      </div>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h4 className="font-semibold text-secondary-900 mb-3">Secondary Service Area</h4>
                  <div className="space-y-2">
                    {step1Data?.citiesInSecondaryRadius.slice(0, 5).map((city, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-secondary-700">{city.name}, {city.state}</span>
                        <span className="text-secondary-500">{city.population.toLocaleString()}</span>
                      </div>
                    ))}
                    {step1Data && step1Data.citiesInSecondaryRadius.length > 5 && (
                      <div className="text-xs text-secondary-500 italic">
                        +{step1Data.citiesInSecondaryRadius.length - 5} more cities
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={generateMap}
              disabled={!step1Data}
              className="btn-primary"
            >
              Generate Service Area Map
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 