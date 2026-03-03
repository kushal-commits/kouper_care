import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { FilterState } from "@/pages/Patients";

interface PatientsFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  filteredCount: number;
  totalCount: number;
}

export function PatientsFilters({ filters, onFiltersChange, filteredCount, totalCount }: PatientsFiltersProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      riskLevel: "",
      nurse: "",
      adlCategory: ""
    });
  };

  const removeFilter = (key: keyof FilterState) => {
    onFiltersChange({ ...filters, [key]: "" });
  };

  const activeFilters = Object.entries(filters).filter(([_, value]) => value !== "");

  return (
    <div className="flex flex-col space-y-4 bg-card p-6 rounded-lg border shadow-clinical">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <div className="text-sm text-muted-foreground">
            Showing {filteredCount} of {totalCount} patients
          </div>
        </div>
        {activeFilters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>
        
        {/* Risk Level */}
        <Select value={filters.riskLevel} onValueChange={(value) => updateFilter("riskLevel", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="critical">Critical Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Nurse */}
        <Select value={filters.nurse} onValueChange={(value) => updateFilter("nurse", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Assigned Nurse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sarah">Sarah Johnson, RN</SelectItem>
            <SelectItem value="mike">Mike Chen, RN</SelectItem>
            <SelectItem value="lisa">Lisa Rodriguez, RN</SelectItem>
            <SelectItem value="david">David Kim, RN</SelectItem>
          </SelectContent>
        </Select>
        
        {/* ADL Category */}
        <Select value={filters.adlCategory} onValueChange={(value) => updateFilter("adlCategory", value)}>
          <SelectTrigger>
            <SelectValue placeholder="ADL Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bathing">Bathing</SelectItem>
            <SelectItem value="dressing">Dressing</SelectItem>
            <SelectItem value="toileting">Toileting</SelectItem>
            <SelectItem value="transferring">Transferring</SelectItem>
            <SelectItem value="eating">Eating</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map(([key, value]) => (
            <Badge 
              key={key} 
              variant="secondary" 
              className="bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
              onClick={() => removeFilter(key as keyof FilterState)}
            >
              {key === "search" ? `Search: ${value}` : 
               key === "riskLevel" ? `Risk: ${value}` :
               key === "nurse" ? `Nurse: ${value}` :
               key === "adlCategory" ? `Category: ${value}` : value}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}