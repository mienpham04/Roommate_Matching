import { useEffect, useState } from "react";
import { DollarSign } from "lucide-react";

function BudgetField({ label, value, onSave, isEditMode = true }) {
  const [budgetValue, setBudgetValue] = useState(value || { min: 0, max: 0 });

  useEffect(() => {
    setBudgetValue(value || { min: 0, max: 0 });
  }, [value]);

  const handleChange = (field, val) => {
    const updated = { ...budgetValue, [field]: parseInt(val) || 0 };
    setBudgetValue(updated);
    if (onSave) {
      onSave("budget", updated);
    }
  };

  const formatBudget = (budget) => {
    if (!budget || (budget.min === 0 && budget.max === 0)) {
      return null;
    }
    return `$${budget.min?.toLocaleString() || 0} - $${budget.max?.toLocaleString() || 0}/month`;
  };

  return (
    <div className="form-control w-full md:col-span-2">
      <label className="label p-1 min-h-0 h-auto mb-1">
        <span className="label-text text-xs font-semibold text-base-content/60 uppercase tracking-wider">{label}</span>
      </label>

      <div className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200
        ${isEditMode ? "border-primary/30 bg-base-100" : "border-base-300 bg-base-200/30"}
        min-h-11`}
      >
        <DollarSign className={`size-4 ${isEditMode ? "text-primary" : "text-base-content/50"}`} />

        {isEditMode ? (
          <div className="grow flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-base-content/60">Min:</span>
              <input
                type="number"
                className="w-24 bg-transparent outline-none text-sm text-base-content border-b border-base-300 px-1"
                value={budgetValue.min || 0}
                onChange={(e) => handleChange("min", e.target.value)}
                min="0"
              />
            </div>
            <span className="text-base-content/40">-</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-base-content/60">Max:</span>
              <input
                type="number"
                className="w-24 bg-transparent outline-none text-sm text-base-content border-b border-base-300 px-1"
                value={budgetValue.max || 0}
                onChange={(e) => handleChange("max", e.target.value)}
                min="0"
              />
            </div>
            <span className="text-xs text-base-content/40">/month</span>
          </div>
        ) : (
          <span className="grow text-sm text-base-content font-medium truncate">
            {formatBudget(budgetValue) || <span className="text-base-content/30 italic">Not set</span>}
          </span>
        )}
      </div>
    </div>
  );
}

export default BudgetField;
