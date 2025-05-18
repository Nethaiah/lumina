import React from 'react';
import { useChat } from '@/context/ChatContext';
import { CalculationData } from '@/api/types';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export type Appliance = {
  name: string
  usage: number
  unit: string
  currency: string
}

export type Options = {
  dailyUsage: number,
  monthlyusage: number,
  yearlyUsage: number,
  monthlyBill: number,
  yearlyBill: number,
  selected: boolean,
  appliance: Appliance
}

const CalculationSelector = () => {
  const {
    userCalculations,
    selectedCalculation,
    setSelectedCalculation,
    calculationsLoading,
    calculationsError,
    fetchUserCalculations,
    setInput,
  } = useChat();

  const [expandedCalculation, setExpandedCalculation] = React.useState<string | null>(null);

  // Function to format timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Function to generate a fallback name if none exists
  const getCalculationDisplayName = (calculation: CalculationData, index: number, totalCount: number) => {
    if (calculation.name) {
      return calculation.name;
    }

    // Fallback name if no custom name exists
    if (calculation.appliances && calculation.appliances.length > 0) {
      const mainAppliance = calculation.appliances[0].name;
      const remainingCount = calculation.appliances.length - 1;

      if (remainingCount > 0) {
        return `${mainAppliance} + ${remainingCount} ${remainingCount === 1 ? "other" : "others"}`;
      }
      return mainAppliance;
    }

    // Last resort: use calculation number
    return `Calculation #${totalCount - index}`;
  };

  // Toggle expansion for a calculation
  const toggleCalculation = (id: string) => {
    setExpandedCalculation(expandedCalculation === id ? null : id);
  };

  // Extract weeks from string
  const extractWeeks = (weeksString: string) => {
    const match = weeksString?.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 4;
  };

  // Function to generate default prompt for selected calculation
  const generateDefaultPrompt = (calculation: CalculationData) => {
    const applianceList = calculation.appliances
      .map(app => `- ${app.name}: ${app.watt}W, ${app.hours}h/day, ${app.days.length} days/week`)
      .join('\n');

    return `Could you analyze my electricity consumption and provide recommendations for energy savings? Here are my current usage details:

Monthly Total Cost: ₱${calculation.totalCost.toFixed(2)}
Daily Usage Cost: ₱${calculation.totalCostPerDay.toFixed(2)}
Number of Appliances: ${calculation.appliances.length}

Appliance Details:
${applianceList}

Please provide:
1. Analysis of my consumption pattern and identify high-consumption appliances
2. Specific recommendations for reducing electricity usage
3. Potential cost savings estimates if recommendations are implemented
4. Energy-efficient alternatives for high-consumption appliances
5. Best practices for using these appliances more efficiently`;
  };

  // Handle calculation selection with default prompt
  const handleCalculationSelect = (calculation: CalculationData) => {
    if (selectedCalculation?.id === calculation.id) {
      setSelectedCalculation(null);
      setInput('');
    } else {
      setSelectedCalculation(calculation);
      setInput(generateDefaultPrompt(calculation));
    }
  };

  // Show loading state
  if (calculationsLoading) {
    return (
      <Card className="p-4 mb-4 bg-[#212121] text-slate-200">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading calculations...</span>
        </div>
      </Card>
    );
  }

  // Show error state with retry button
  if (calculationsError) {
    return (
      <Card className="p-4 mb-4 bg-[#212121] text-slate-200">
        <div className="text-sm text-red-400 mb-2">{calculationsError}</div>
        <Button onClick={fetchUserCalculations} variant="outline" size="sm">
          Retry
        </Button>
      </Card>
    );
  }

  // Show empty state
  if (userCalculations.length === 0) {
    return (
      <Card className="p-4 mb-4 bg-[#212121] text-slate-200">
        <div className="text-sm text-slate-400">
          No calculations found. Complete a calculation first to get AI analysis.
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold mb-4 text-cta-bluegreen">Select Calculation for Analysis</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {userCalculations.map((calc, index) => (
            <div key={calc.id} className="bg-[#383c3d] p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Checkbox
                    id={calc.id}
                    checked={selectedCalculation?.id === calc.id}
                    onCheckedChange={() => handleCalculationSelect(calc)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={calc.id}
                      className="text-white cursor-pointer"
                    >
                      <div className="font-medium">
                        {getCalculationDisplayName(calc, index, userCalculations.length)}
                      </div>
                      <div className="text-sm text-white/60">
                        {formatDate(calc.timestamp)}
                      </div>
                      <div className="text-sm text-cta-bluegreen mt-1">
                        Monthly Cost: ₱{calc.totalCost.toFixed(2)}
                      </div>
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => toggleCalculation(calc.id)}
                  className="text-cta-bluegreen px-2 py-1"
                >
                  {expandedCalculation === calc.id ? (
                    <FaChevronUp size={18} />
                  ) : (
                    <FaChevronDown size={18} />
                  )}
                </button>
              </div>

              {expandedCalculation === calc.id && (
                <div className="mt-4 pl-8">
                  <div className="text-sm space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-cta-bluegreen font-medium">Appliances:</h4>
                      {calc.appliances.map((appliance, i) => (
                        <div key={i} className="bg-[#212121] p-3 rounded">
                          <div className="font-medium text-white">
                            {appliance.name} ({appliance.quantity || 1} unit{appliance.quantity > 1 ? 's' : ''})
                          </div>
                          <div className="mt-2 text-white/70 text-sm">
                            <div>Wattage: {appliance.watt}W</div>
                            <div>Usage: {appliance.hours}h/day</div>
                            <div>Days/Week: {appliance.days.length}</div>
                            <div>Monthly Cost: ₱{(appliance.costPerWeek * extractWeeks(appliance.weeks)).toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#586669] p-3 rounded-lg">
                        <div className="text-white/80">Daily Cost</div>
                        <div className="text-lg font-bold">₱{calc.totalCostPerDay.toFixed(2)}</div>
                      </div>
                      <div className="bg-[#586669] p-3 rounded-lg">
                        <div className="text-white/80">Weekly Cost</div>
                        <div className="text-lg font-bold">₱{calc.totalCostPerWeek.toFixed(2)}</div>
                      </div>
                      <div className="bg-[#586669] p-3 rounded-lg col-span-2">
                        <div className="text-white/80">Monthly Cost</div>
                        <div className="text-lg font-bold">₱{calc.totalCost.toFixed(2)}</div>
                      </div>
                    </div>

                    {calc.monthlyBill && (
                      <div className="bg-[#586669] p-3 rounded-lg">
                        <div className="text-white/80">Monthly Bill</div>
                        <div className="text-lg font-bold">₱{calc.monthlyBill.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default CalculationSelector;
