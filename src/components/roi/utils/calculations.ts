export type CalculatorMode = 'full' | '811' | 'jobcosting' | 'payroll' | 'priceperfoot'

export interface ROIInputs {
  // --- Existing / General ---
  teamSize: number | null
  basePay: number | null
  loadPercent: number | null
  adminHoursPerWeek: number | null
  annualRevenue: number | null
  efficiencyPercent: number | null

  // --- 811 Module ---
  ticketsPerMonth: number | null
  avgTicketTimeOld: number | null
  missedTicketCostAvg: number | null

  // --- Job Costing Module ---
  projectsPerYear: number | null
  avgProjectValue: number | null
  currentMarginVisibility: 'none' | 'end-of-job' | 'weekly' | 'daily' | null

  // --- Payroll Module ---
  weeklyPayrollHours: number | null
  timeDisputes: number | null
  avgDisputeCost: number | null

  // --- Price Per Foot Module ---
  avgBoreFootage: number | null
  currentPricePerFoot: number | null
  estimatedCostPerFoot: number | null
}

export const INITIAL_INPUTS: ROIInputs = {
  teamSize: null,
  basePay: null,
  loadPercent: 25, // Default 25%
  adminHoursPerWeek: null,
  annualRevenue: null,
  efficiencyPercent: 50, // Default 50%

  ticketsPerMonth: null,
  avgTicketTimeOld: 30, // Default 30 mins
  missedTicketCostAvg: 500, // Default $500

  projectsPerYear: null,
  avgProjectValue: null,
  currentMarginVisibility: null,

  weeklyPayrollHours: null,
  timeDisputes: null,
  avgDisputeCost: 50, // Default $50

  avgBoreFootage: null,
  currentPricePerFoot: null,
  estimatedCostPerFoot: null,
}

export interface ROIResults {
  // Summary
  totalAnnualSavings: number
  totalHoursSaved: number
  roiMultiplier: number

  // By category
  ticket811Savings: number
  ticket811HoursSaved: number

  jobCostingSavings: number
  marginRecovery: number

  payrollSavings: number
  disputeSavings: number

  pricePerFootInsight: {
    estimatedTrueCost: number
    currentMargin: number
    potentialMargin: number
    recommendation: string
  }

  // Original calculations
  fullyLoadedHourly: number
  annualCostOfWaste: number
  annualSavings: number
  extraProfit: number
}

export function calculateROI(inputs: ROIInputs): ROIResults {
  // --- Helpers ---
  const getNum = (val: number | null, fallback = 0) => val ?? fallback

  // --- Core / Labor ---
  const W = getNum(inputs.basePay, 25)
  const L = getNum(inputs.loadPercent, 25) / 100
  const B = 0.05 // Bonus factor
  const fullyLoadedHourly = W * (1 + L + B)

  // --- 811 Module ---
  const ticketsPerMonth = getNum(inputs.ticketsPerMonth, 0)
  const avgTicketTimeOld = getNum(inputs.avgTicketTimeOld, 30)
  const missedTicketCostAvg = getNum(inputs.missedTicketCostAvg, 500)
  
  // HDD Nexus takes ~2 mins per ticket
  const ticketTimeSavedPerMonth = (ticketsPerMonth * (avgTicketTimeOld - 2)) / 60 // hours
  const ticket811HoursSaved = ticketTimeSavedPerMonth * 12
  const ticket811LaborSavings = ticket811HoursSaved * fullyLoadedHourly
  
  // Risk Avoidance (assume 5% miss rate reduced to near 0)
  const riskAvoidanceSavings = (ticketsPerMonth * 0.05) * missedTicketCostAvg * 12
  
  const ticket811Savings = ticket811LaborSavings + riskAvoidanceSavings

  // --- Job Costing Module ---
  const projectsPerYear = getNum(inputs.projectsPerYear, 0)
  const avgProjectValue = getNum(inputs.avgProjectValue, 0)
  // Assume 3% margin recovery from better visibility
  const marginRecovery = projectsPerYear * avgProjectValue * 0.03
  const jobCostingSavings = marginRecovery

  // --- Payroll Module ---
  const weeklyPayrollHours = getNum(inputs.weeklyPayrollHours, 0)
  const timeDisputes = getNum(inputs.timeDisputes, 0)
  const avgDisputeCost = getNum(inputs.avgDisputeCost, 50)

  // 70% reduction in processing time
  const payrollHoursSavedAnnual = weeklyPayrollHours * 0.7 * 52
  const payrollProcessingSavings = payrollHoursSavedAnnual * fullyLoadedHourly
  const disputeSavings = timeDisputes * avgDisputeCost * 12
  
  const payrollSavings = payrollProcessingSavings + disputeSavings

  // --- Price Per Foot Analysis ---
  const avgBoreFootage = getNum(inputs.avgBoreFootage, 500) // avoid div by 0
  const currentPricePerFoot = getNum(inputs.currentPricePerFoot, 0)
  const estimatedCostPerFoot = getNum(inputs.estimatedCostPerFoot, currentPricePerFoot * 0.8)
  
  const currentMargin = currentPricePerFoot - estimatedCostPerFoot
  const potentialMargin = currentMargin * 1.15 // 15% improvement
  const pricePerFootInsight = {
    estimatedTrueCost: estimatedCostPerFoot,
    currentMargin,
    potentialMargin,
    recommendation: currentMargin < 0 ? "Critical: Review Pricing" : "Optimize Bidding"
  }

  // --- Original / Admin Logic ---
  const H_week = getNum(inputs.adminHoursPerWeek, 5)
  const annualWastedHours = H_week * 52
  const annualCostOfWaste = annualWastedHours * fullyLoadedHourly
  
  const E = getNum(inputs.efficiencyPercent, 25) / 100
  const annualHoursSaved = annualWastedHours * E
  const annualSavings = annualHoursSaved * fullyLoadedHourly // Core admin savings
  
  const R = getNum(inputs.annualRevenue, 1_000_000)
  const M = 0.01 
  const extraProfit = R * M

  // --- Totals ---
  // Note: We sum module savings + core admin savings (careful not to double count if intent overlaps)
  // For this calculator, we treat them as additive distinct categories unless specified.
  // 811 is specific admin, "adminHoursPerWeek" is general. We'll sum them.
  
  const totalAnnualSavings = 
    ticket811Savings + 
    jobCostingSavings + 
    payrollSavings + 
    annualSavings + 
    extraProfit

  const totalHoursSaved = 
    ticket811HoursSaved + 
    payrollHoursSavedAnnual + 
    annualHoursSaved

  // Assume subscription cost is roughly $5k/year for ROI multi
  const subscriptionCost = 5000 
  const roiMultiplier = totalAnnualSavings / subscriptionCost

  return {
    totalAnnualSavings,
    totalHoursSaved,
    roiMultiplier,
    ticket811Savings,
    ticket811HoursSaved,
    jobCostingSavings,
    marginRecovery,
    payrollSavings,
    disputeSavings,
    pricePerFootInsight,
    fullyLoadedHourly,
    annualCostOfWaste,
    annualSavings,
    extraProfit
  }
}
