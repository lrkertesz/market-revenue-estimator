'use client'

import { useState } from 'react'
import { CensusData, IndustryData, MapData, ReportData } from '@/types/estimator'

interface Step4ReportProps {
  onBack: () => void
  step1Data: CensusData | null
  step2Data: IndustryData | null
  step3Data: MapData | null
  data: ReportData | null
}

export default function Step4Report({ onBack, step1Data, step2Data, step3Data, data }: Step4ReportProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(data)

  const generateReport = async () => {
    if (!step1Data || !step2Data || !step3Data) {
      alert('Please complete all previous steps first')
      return
    }

    setIsGenerating(true)

    try {
      const report: ReportData = {
        title: `Market Revenue Analysis - ${step1Data.city}, ${step1Data.state}`,
        generatedDate: new Date().toLocaleDateString(),
        summary: {
          totalRevenue: step2Data.totalRevenue,
          totalCities: step1Data.citiesInPrimaryRadius.length + step1Data.citiesInSecondaryRadius.length,
          primaryMarketRevenue: step2Data.totalRevenue * 0.7, // Estimate 70% from primary market
          secondaryMarketRevenue: step2Data.totalRevenue * 0.3 // Estimate 30% from secondary market
        },
        recommendations: [
          'Focus marketing efforts on the primary service area for maximum ROI',
          'Consider expanding to secondary service area as business grows',
          'Develop service packages targeting different housing types',
          'Monitor market penetration and adjust pricing strategy accordingly',
          'Build relationships with property managers in multi-family units'
        ],
        exportFormats: ['PDF', 'Excel', 'Word']
      }

      setReportData(report)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report. Please try again.')
    } finally {
      setIsGenerating(false)
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

  const exportReport = (format: string) => {
    // In a real implementation, this would generate and download the report
    alert(`Exporting report as ${format}...`)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-secondary-900">
            Step 4: Market Research Report
          </h2>
          <button onClick={onBack} className="btn-secondary">
            ← Back to Step 3
          </button>
        </div>

        {step1Data && step2Data && step3Data && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Analysis Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Target Market:</span> {step1Data.city}, {step1Data.state}
              </div>
              <div>
                <span className="font-medium">Total Revenue:</span> {formatCurrency(step2Data.totalRevenue)}
              </div>
              <div>
                <span className="font-medium">Service Areas:</span> {step1Data.primaryRadius}mi / {step1Data.secondaryRadius}mi
              </div>
              <div>
                <span className="font-medium">Cities Analyzed:</span> {step1Data.citiesInPrimaryRadius.length + step1Data.citiesInSecondaryRadius.length}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-secondary-100 p-4 rounded-lg">
            <h3 className="font-semibold text-secondary-900 mb-2">Final Report Generation</h3>
            <p className="text-secondary-600 text-sm">
              Generate a comprehensive market research report that can be shared with business owners and stakeholders.
            </p>
          </div>

          {!reportData && (
            <button
              onClick={generateReport}
              disabled={isGenerating || !step1Data || !step2Data || !step3Data}
              className="btn-primary"
            >
              {isGenerating ? 'Generating Report...' : 'Generate Market Research Report'}
            </button>
          )}

          {reportData && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                  {reportData.title}
                </h3>
                <p className="text-secondary-600 mb-4">
                  Generated on {reportData.generatedDate}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Revenue Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Revenue Potential:</span>
                        <span className="font-semibold">{formatCurrency(reportData.summary.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Primary Market:</span>
                        <span>{formatCurrency(reportData.summary.primaryMarketRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Secondary Market:</span>
                        <span>{formatCurrency(reportData.summary.secondaryMarketRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cities in Service Area:</span>
                        <span>{reportData.summary.totalCities}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Market Insights</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Target City:</span> {step1Data?.city}, {step1Data?.state}
                      </div>
                      <div>
                        <span className="font-medium">Population:</span> {step1Data?.population.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Housing Units:</span> {step1Data?.totalHousingUnits.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Market Penetration:</span> {step2Data?.marketPenetration.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-secondary-900 mb-3">Strategic Recommendations</h4>
                  <ul className="space-y-2">
                    {reportData.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-600 mr-2">•</span>
                        <span className="text-secondary-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-secondary-900 mb-3">Export Options</h4>
                  <div className="flex flex-wrap gap-2">
                    {reportData.exportFormats.map((format) => (
                      <button
                        key={format}
                        onClick={() => exportReport(format)}
                        className="btn-secondary"
                      >
                        Export as {format}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <h4 className="font-semibold text-secondary-900 mb-3">Next Steps</h4>
                <div className="space-y-3 text-sm text-secondary-700">
                  <p>1. Review the revenue potential and market analysis</p>
                  <p>2. Consider the strategic recommendations for your business</p>
                  <p>3. Export the report for sharing with stakeholders</p>
                  <p>4. Use this data to inform your business planning and marketing strategy</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 