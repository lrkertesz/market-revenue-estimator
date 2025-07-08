import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

// Helper: Haversine distance in miles
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (x: number) => x * Math.PI / 180
  const R = 3958.8 // Radius of Earth in miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Helper: Delay for rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper: Get lat/lng for a city using Google Maps Geocoding API
async function geocodeCity(city: string, state: string, apiKey: string) {
  const address = encodeURIComponent(`${city}, ${state}`)
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.status === 'OK' && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry.location
    return { lat, lng }
  }
  throw new Error('Failed to geocode city')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { city, state, primaryRadius, secondaryRadius } = body

    // Validate input
    if (!city || !state || !primaryRadius || !secondaryRadius) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Load environment variables
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!googleMapsApiKey) {
      return NextResponse.json(
        { success: false, message: 'API keys not configured' },
        { status: 500 }
      )
    }

    // Load US cities data
    const citiesPath = path.join(process.cwd(), 'data', 'us-cities.json')
    const citiesRaw = await fs.readFile(citiesPath, 'utf-8')
    const allCities = JSON.parse(citiesRaw)

    // Geocode the target city
    const targetGeo = await geocodeCity(city, state, googleMapsApiKey)
    if (!targetGeo) throw new Error('Could not geocode target city')

    // Find the state code for the target city
    const stateCode = allCities.find((c: any) =>
      c.city.toLowerCase() === city.toLowerCase() && c.state_id.toLowerCase() === state.toLowerCase()
    )?.state_id || state

    // Find all cities within the radii
    const primaryCities = []
    const secondaryCities = []
    for (const c of allCities) {
      if (c.state_id.toLowerCase() !== stateCode.toLowerCase()) continue
      if (!c.city || !c.state_id || !c.lat || !c.lng || !c.population) continue
      const dist = haversineDistance(
        targetGeo.lat,
        targetGeo.lng,
        parseFloat(c.lat),
        parseFloat(c.lng)
      )
      if (dist <= primaryRadius) {
        primaryCities.push({ ...c, dist })
      } else if (dist <= secondaryRadius) {
        secondaryCities.push({ ...c, dist })
      }
    }

    // Helper to get housing data for a city (estimate for now)
    function getCityHousingData(cityObj: any) {
      const population = parseInt(cityObj.population, 10)
      // Estimate: 70% single, 30% multi (can be improved with Census API)
      const totalUnits = Math.round(population / 2.5) // average household size fallback
      const singleFamily = Math.round(totalUnits * 0.7)
      const multiFamily = Math.round(totalUnits * 0.3)
      const commercialUnits = Math.round(population / 50)
      return {
        name: cityObj.city,
        state: cityObj.state_id,
        population,
        singleFamilyUnits: singleFamily,
        multiFamilyUnits: multiFamily,
        commercialUnits,
        totalHousingUnits: singleFamily + multiFamily + commercialUnits,
        coordinates: {
          lat: parseFloat(cityObj.lat),
          lng: parseFloat(cityObj.lng)
        }
      }
    }

    // Get housing data for all primary and secondary cities
    const primaryResults = primaryCities.map(getCityHousingData)
    const secondaryResults = secondaryCities.map(getCityHousingData)

    // Also get data for the target city itself
    const targetCityObj = allCities.find((c: any) =>
      c.city.toLowerCase() === city.toLowerCase() && c.state_id.toLowerCase() === stateCode.toLowerCase()
    )
    let targetCityData = null
    if (targetCityObj) {
      targetCityData = getCityHousingData(targetCityObj)
    }

    // Build response
    return NextResponse.json({
      success: true,
      data: {
        city,
        state: stateCode,
        population: targetCityData?.population || null,
        singleFamilyUnits: targetCityData?.singleFamilyUnits || null,
        multiFamilyUnits: targetCityData?.multiFamilyUnits || null,
        commercialUnits: targetCityData?.commercialUnits || null,
        totalHousingUnits: targetCityData?.totalHousingUnits || null,
        primaryRadius,
        secondaryRadius,
        citiesInPrimaryRadius: primaryResults,
        citiesInSecondaryRadius: secondaryResults
      }
    })

  } catch (error) {
    console.error('Error in census-data route:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}