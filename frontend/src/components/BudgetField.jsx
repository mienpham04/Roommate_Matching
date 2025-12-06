import { useEffect, useState } from "react";
import { Pencil, X, Check, DollarSign } from "lucide-react";

function BudgetField({ label, value, onSave, isEditMode = true }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || { min: 0, max: 0 });
  const [tempValue, setTempValue] = useState(value || { min: 0, max: 0 });

  useEffect(() => {
    const budgetValue = value || { min: 0, max: 0 };
    setCurrentValue(budgetValue);
    setTempValue(budgetValue);
  }, [value]);

  const handleSave = () => {
    setCurrentValue(tempValue);
    setIsEditing(false);

    if (onSave) {
      onSave("budget", tempValue);
    }
  };

  const handleCancel = () => {
    setTempValue(currentValue);
    setIsEditing(false);
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
        ${isEditing ? "border-primary bg-base-100 ring-1 ring-primary/20" : "border-base-300 bg-base-200/30"}
        min-h-11`}
      >
        <DollarSign className={`size-4 ${isEditing ? "text-primary" : "text-base-content/50"}`} />

        {isEditing ? (
          <>
            <div className="grow flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-base-content/60">Min:</span>
                <input
                  type="number"
                  className="w-24 bg-transparent outline-none text-sm text-base-content border-b border-base-300 px-1"
                  value={tempValue.min || 0}
                  onChange={(e) => setTempValue({ ...tempValue, min: parseInt(e.target.value) || 0 })}
                  min="0"
                  autoFocus
                />
              </div>
              <span className="text-base-content/40">-</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-base-content/60">Max:</span>
                <input
                  type="number"
                  className="w-24 bg-transparent outline-none text-sm text-base-content border-b border-base-300 px-1"
                  value={tempValue.max || 0}
                  onChange={(e) => setTempValue({ ...tempValue, max: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <span className="text-xs text-base-content/40">/month</span>
            </div>

            <div className="flex gap-1">
              <button onClick={handleSave} className="btn btn-circle btn-xs btn-success text-white">
                <Check size={12} />
              </button>
              <button onClick={handleCancel} className="btn btn-circle btn-xs btn-ghost text-base-content/60">
                <X size={12} />
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="grow text-sm text-base-content font-medium truncate">
              {formatBudget(currentValue) || <span className="text-base-content/30 italic">Not set</span>}
            </span>

            {isEditMode && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-primary"
              >
                <Pencil size={14} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default BudgetField;
