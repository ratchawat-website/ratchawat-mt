"use client";

import { Check } from "lucide-react";
import { ReactNode } from "react";

interface BookingWizardProps {
  steps: string[];
  currentStep: number;
  onStepChange: (step: number) => void;
  canProceed: boolean;
  isFinalStep: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit?: () => void;
  children: ReactNode;
}

export default function BookingWizard({
  steps,
  currentStep,
  onStepChange,
  canProceed,
  isFinalStep,
  isSubmitting = false,
  submitLabel = "Pay",
  onSubmit,
  children,
}: BookingWizardProps) {
  return (
    <div>
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-10">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <button
              type="button"
              onClick={() => i < currentStep && onStepChange(i)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < currentStep
                  ? "bg-primary text-white cursor-pointer"
                  : i === currentStep
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-surface-lowest text-on-surface-variant"
              }`}
              aria-label={`Step ${i + 1}: ${label}`}
              aria-current={i === currentStep ? "step" : undefined}
            >
              {i < currentStep ? <Check size={14} aria-hidden="true" /> : i + 1}
            </button>
            <span
              className={`text-xs font-medium hidden sm:block ${
                i <= currentStep ? "text-on-surface" : "text-on-surface-variant"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  i < currentStep ? "bg-primary" : "bg-outline-variant"
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div>{children}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={() => onStepChange(currentStep - 1)}
            className="text-on-surface-variant text-sm font-medium hover:text-on-surface transition-colors"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {isFinalStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting}
            className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-colors text-sm ${
              canProceed && !isSubmitting
                ? "bg-primary text-white hover:bg-primary-dim"
                : "bg-surface-lowest text-on-surface-variant cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Processing..." : submitLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => canProceed && onStepChange(currentStep + 1)}
            disabled={!canProceed}
            className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-colors text-sm ${
              canProceed
                ? "bg-primary text-white hover:bg-primary-dim"
                : "bg-surface-lowest text-on-surface-variant cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
