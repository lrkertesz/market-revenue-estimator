# Market Revenue Estimator

A modern web application for estimating annual revenue potential for local service businesses using US Census data and Google Maps integration.

## Features

- **4-Step Workflow**: Discrete steps to avoid complexity and timing issues
- **Census Data Integration**: Real US Census Bureau data for housing units
- **Google Maps Visualization**: Interactive service area mapping
- **Industry-Specific Calculations**: HVAC, plumbing, electrical, and more
- **Climate Zone Adjustments**: Regional HVAC adoption rates
- **Revenue Estimation**: Based on service lifecycles and market penetration
- **Export Capabilities**: PDF, Excel, and Word report generation

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Google Maps JavaScript API
- **Data**: US Census Bureau API
- **Deployment**: Vercel (optimized)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Maps API key
- US Census Bureau API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd market-revenue-estimator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Census Bureau API Key
   CENSUS_API_KEY=your_census_api_key_here
   
   # Google Maps API Key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. **Get API Keys**
   - **Census API**: Sign up at https://api.census.gov/data/key_signup.html
   - **Google Maps**: Get API key at https://developers.google.com/maps/documentation/javascript/get-api-key

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Application Workflow

### Step 1: Census Data Collection
- Enter target city and state
- Set primary (1-15 miles) and secondary (10-25 miles) service areas
- Retrieve housing unit data from US Census Bureau
- Display comprehensive table of cities and housing data

### Step 2: Industry Selection & Revenue Calculation
- Select target industry (HVAC, plumbing, electrical, etc.)
- Apply industry-specific service lifecycles and costs
- Calculate revenue potential using climate zone adjustments
- Generate sanity check calculations

### Step 3: Service Area Map
- Visualize primary and secondary service areas
- Interactive Google Maps integration
- Display city listings within service areas

### Step 4: Market Research Report
- Generate comprehensive market analysis
- Strategic recommendations for business planning
- Export options (PDF, Excel, Word)
- Summary of revenue potential and market insights

## HVAC Industry Data

The application includes comprehensive HVAC service data:

### Service Lifecycles
- Filter Replacement: 1-3 months
- Coil Cleaning: Annually
- Drain Line Cleaning: Annually
- System Tune-up: Annually
- Refrigerant Recharge: 2-3 years
- Duct Cleaning: 3-5 years
- Electrical Component Check: Annually
- Motor Lubrication: Annually

### Climate Zone Adjustments
- Hot-Humid (FL, TX, LA): 92% HVAC adoption
- Hot-Dry (AZ, NV, NM): 88% HVAC adoption
- Mixed-Humid (GA, NC, SC): 83% HVAC adoption
- Mixed-Dry (CA, CO, UT): 78% HVAC adoption
- Cold (MN, WI, MI): 88% HVAC adoption
- Very Cold (ND, MT, ME): 83% HVAC adoption
- Marine (WA, OR): 68% HVAC adoption

## Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push to main branch

3. **Environment Variables in Vercel**
   - `CENSUS_API_KEY`: Your Census Bureau API key
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Same as above

## API Endpoints

### POST /api/census-data
Fetches housing data from US Census Bureau

**Request Body:**
```json
{
  "city": "San Francisco",
  "state": "CA",
  "primaryRadius": 10,
  "secondaryRadius": 25
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "city": "San Francisco",
    "state": "CA",
    "population": 873965,
    "singleFamilyUnits": 150000,
    "multiFamilyUnits": 250000,
    "commercialUnits": 50000,
    "totalHousingUnits": 450000,
    "primaryRadius": 10,
    "secondaryRadius": 25,
    "citiesInPrimaryRadius": [...],
    "citiesInSecondaryRadius": [...]
  }
}
```

## Project Structure

```
market-revenue-estimator/
├── app/
│   ├── api/
│   │   └── census-data/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Step1CensusData.tsx
│   ├── Step2IndustrySelect.tsx
│   ├── Step3Map.tsx
│   ├── Step4Report.tsx
│   └── StepIndicator.tsx
├── types/
│   └── estimator.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Real Census API integration
- [ ] Google Maps visualization
- [ ] Additional industry templates
- [ ] Advanced reporting features
- [ ] User authentication
- [ ] Data persistence
- [ ] Mobile optimization 