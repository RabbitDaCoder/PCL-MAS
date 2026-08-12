// Generic multi-step registration engine shared by student and lecturer registration; each page only supplies field steps + confirmation summary.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "./AuthCard";
import AuthHeader from "./AuthHeader";
import AuthButton from "./AuthButton";
import AuthFooter from "./AuthFooter";
import FormError from "./FormError";
import StepIndicator from "./StepIndicator";

export default function MultiStepAuthForm({
  heading,
  description,
  steps,
  confirmationSummary,
  submitLabel,
  onSubmit,
  loginPrompt,
  loginActionLabel,
  loginHref,
}) {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConfirmationStep = stepIndex === steps.length;
  const currentStep = steps[stepIndex];
  const stepLabels = [...steps.map((step) => step.title), "Confirmation"];

  function setValue(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleContinue(event) {
    event.preventDefault();
    const stepErrors = currentStep.validate ? currentStep.validate(values) : {};
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setFormError("");
    setStepIndex((index) => index + 1);
  }

  function handleBack() {
    setFormError("");
    setStepIndex((index) => Math.max(0, index - 1));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      await onSubmit(values);
      // Don't auto-login on register — send the user to sign in with a success banner instead.
      navigate(loginHref, { state: { registered: true } });
    } catch (error) {
      setFormError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard className="sm:max-w-lg">
      <AuthHeader heading={heading} description={description} />
      <StepIndicator steps={stepLabels} currentStep={stepIndex + 1} />

      {isConfirmationStep ? (
        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit}
          noValidate
        >
          <dl className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] p-5">
            {confirmationSummary(values).map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <dt className="text-[var(--color-text-secondary)]">
                  {item.label}
                </dt>
                <dd className="font-medium text-[var(--color-text)]">
                  {item.value || "—"}
                </dd>
              </div>
            ))}
          </dl>
          <FormError message={formError} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <AuthButton
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1"
            >
              Back
            </AuthButton>
            <AuthButton
              type="submit"
              loading={isSubmitting}
              loadingLabel="Creating account..."
              className="flex-1"
            >
              {submitLabel}
            </AuthButton>
          </div>
        </form>
      ) : (
        <form
          className="flex flex-col gap-5"
          onSubmit={handleContinue}
          noValidate
        >
          {currentStep.render(values, setValue, errors)}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {stepIndex > 0 ? (
              <AuthButton
                type="button"
                variant="secondary"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </AuthButton>
            ) : null}
            <AuthButton type="submit" className="flex-1">
              Continue
            </AuthButton>
          </div>
        </form>
      )}

      {stepIndex === 0 ? (
        <div className="mt-6">
          <AuthFooter
            prompt={loginPrompt}
            actionLabel={loginActionLabel}
            to={loginHref}
          />
        </div>
      ) : null}
    </AuthCard>
  );
}
