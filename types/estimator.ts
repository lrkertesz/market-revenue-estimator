export interface CensusData {
  city: string
  state: string
  population: number
  singleFamilyUnits: number
  multiFamilyUnits: number
  commercialUnits: number // Estimated
  totalHousingUnits: number
  primaryRadius: number
  secondaryRadius: number
  citiesInPrimaryRadius: CityData[]
  citiesInSecondaryRadius: CityData[]
}

export interface CityData {
  name: string
  state: string
  population: number
  singleFamilyUnits: number
  multiFamilyUnits: number
  commercialUnits: number
  totalHousingUnits: number
  coordinates: {
    lat: number
    lng: number
  }
}

export interface IndustryData {
  industry: string
  services: ServiceJob[]
  totalRevenue: number
  marketPenetration: number
  revenueByCity: RevenueByCity[]
  sanityCheck: SanityCheckData
}

export interface ServiceJob {
  name: string
  lifecycle: string
  singleFamilyCost: {
    min: number
    max: number
  }
  multiFamilyCost: {
    min: number
    max: number
  }
  commercialCost: {
    min: number
    max: number
  }
  estimatedJobs: number
  estimatedRevenue: number
}

export interface RevenueByCity {
  city: string
  state: string
  totalRevenue: number
  services: ServiceJob[]
  housingUnits: {
    singleFamily: number
    multiFamily: number
    commercial: number
  }
}

export interface SanityCheckData {
  method: string
  description: string
  estimatedRevenue: number
  confidence: string
}

export interface MapData {
  center: {
    lat: number
    lng: number
  }
  primaryRadius: number
  secondaryRadius: number
  cities: CityData[]
  mapUrl?: string
}

export interface ReportData {
  title: string
  generatedDate: string
  summary: {
    totalRevenue: number
    totalCities: number
    primaryMarketRevenue: number
    secondaryMarketRevenue: number
  }
  recommendations: string[]
  exportFormats: string[]
}

export interface EstimatorData {
  step1: CensusData | null
  step2: IndustryData | null
  step3: MapData | null
  step4: ReportData | null
}

export interface ClimateZone {
  zone: string
  states: string[]
  acLifespanReduction: string
  furnaceLifespanReduction: string
  hvacAdoption: string
}

export interface HVACService {
  name: string
  lifecycle: string
  singleFamilyCost: {
    min: number
    max: number
  }
  multiFamilyCost: {
    min: number
    max: number
  }
  commercialCost: {
    min: number
    max: number
  }
}

export interface HVACReplacement {
  component: string
  baseLifespan: number
  climateAdjustedLifespan: string
  singleFamilyCost: {
    min: number
    max: number
  }
  multiFamilyCost: {
    min: number
    max: number
  }
  commercialCost: {
    min: number
    max: number
  }
} 