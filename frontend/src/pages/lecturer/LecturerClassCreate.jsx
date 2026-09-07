// Create Class wizard — 4 steps (Basic Info, Course Details, Class Settings, Review & Create).
// Manual useState + validate() pattern, matching the rest of the app's forms (no
// react-hook-form/Yup in this project).
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AuthButton from "../../components/auth/AuthButton";
import Button from "../../components/ui/Button";
import FormError from "../../components/auth/FormError";
import ClassStepIndicator from "../../components/classes/ClassStepIndicator";
import StepBasicInfo from "../../components/classes/steps/StepBasicInfo";
import StepCourseDetails from "../../components/classes/steps/StepCourseDetails";
import StepClassSettings from "../../components/classes/steps/StepClassSettings";
import StepReview from "../../components/classes/steps/StepReview";
import StepMaterialsUpload from "../../components/classes/steps/StepMaterialsUpload";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { createClass, generateClassCode } from "../../services/classService";

const STEPS = [
  { number: 1, label: "Basic Information" },
  { number: 2, label: "Course Details" },
  { number: 3, label: "Class Settings" },
  { number: 4, label: "Review & Create" },
  { number: 5, label: "Materials" },
];

function validateStep1(values) {
  const errors = {};
  if (!values.name) errors.name = "Class name is required.";
  if (!values.courseCode) errors.courseCode = "Course code is required.";
  if (!values.department) errors.department = "Department is required.";
  if (!values.level) errors.level = "Academic level is required.";
  if (!values.semester) errors.semester = "Semester is required.";
  if (!values.academicSession)
    errors.academicSession = "Academic session is required.";
  return errors;
}

function validateStep3(values) {
  const errors = {};
  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    errors.endDate = "End date can't be before the start date.";
  }
  if (
    values.maxStudents &&
    (!Number.isInteger(Number(values.maxStudents)) ||
      Number(values.maxStudents) < 1)
  ) {
    errors.maxStudents = "Enter a whole number of 1 or more.";
  }
  if (values.enrollmentMode === "code" && !values.classCode) {
    errors.classCode = "Couldn't generate a class code — try regenerating it.";
  }
  return errors;
}

const STEP_VALIDATORS = { 1: validateStep1, 3: validateStep3 };

export default function LecturerClassCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [values, setValues] = useState({
    name: "",
    courseCode: "",
    department: user?.department || "",
    level: "",
    semester: "",
    academicSession: "",
    description: "",
    learningObjectives: [],
    topics: [],
    aiInstructions: "",
    startDate: "",
    endDate: "",
    enrollmentMode: "code",
    classCode: "",
    maxStudents: "",
  });
  const [errors, setErrors] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [formError, setFormError] = useState("");
  const [createdClassId, setCreatedClassId] = useState(null);
  const [uploadedMaterials, setUploadedMaterials] = useState([]);

  const currentStep = stepIndex + 1;

  function setValue(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function fetchClassCode() {
    setIsGeneratingCode(true);
    try {
      const { classCode } = await generateClassCode();
      setValue("classCode", classCode);
    } catch (error) {
      showToast(error.message || "Couldn't generate a class code.");
    } finally {
      setIsGeneratingCode(false);
    }
  }

  useEffect(() => {
    if (
      currentStep === 3 &&
      values.enrollmentMode === "code" &&
      !values.classCode
    ) {
      fetchClassCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, values.enrollmentMode]);

  function goToStep(stepNumber) {
    setStepIndex(stepNumber - 1);
  }

  function handleBack() {
    if (createdClassId) return;
    if (stepIndex === 0) {
      navigate("/lecturer/classes");
      return;
    }
    setStepIndex((prev) => prev - 1);
  }

  function handleContinue() {
    const validator = STEP_VALIDATORS[currentStep];
    const validationErrors = validator ? validator(values) : {};
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setMaxStepReached((prev) => Math.max(prev, currentStep + 1));
    setStepIndex((prev) => prev + 1);
  }

  async function handleCreate() {
    setFormError("");
    setIsSubmitting(true);
    try {
      const created = await createClass({
        ...values,
        maxStudents: values.maxStudents
          ? Number(values.maxStudents)
          : undefined,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
      });
      showToast("Class created.", "success");
      setCreatedClassId(created.id);
      setMaxStepReached(5);
      setStepIndex(4);
    } catch (error) {
      setFormError(error.message || "Couldn't create the class.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFinish() {
    navigate(`/lecturer/classes/${createdClassId}`);
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <StepBasicInfo values={values} setValue={setValue} errors={errors} />
        );
      case 2:
        return <StepCourseDetails values={values} setValue={setValue} />;
      case 3:
        return (
          <StepClassSettings
            values={values}
            setValue={setValue}
            errors={errors}
            isGeneratingCode={isGeneratingCode}
            onRegenerateCode={fetchClassCode}
          />
        );
      case 4:
        return <StepReview values={values} onEditStep={goToStep} />;
      case 5:
        return (
          <StepMaterialsUpload
            classId={createdClassId}
            onUploaded={(material) =>
              setUploadedMaterials((prev) => [...prev, material])
            }
          />
        );
      default:
        return null;
    }
  }

  const isReviewStep = currentStep === 4;
  const isMaterialsStep = currentStep === 5;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          Create a class
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Set it up now — you can invite students right after.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-24 sm:pb-0 lg:flex-row lg:items-start lg:gap-10">
        <ClassStepIndicator
          steps={STEPS}
          currentStep={currentStep}
          maxStepReached={maxStepReached}
          onStepClick={createdClassId ? () => {} : goToStep}
        />

        <div className="flex flex-1 flex-col gap-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
          <h2 className="text-lg font-medium text-[var(--color-text)]">
            {STEPS[stepIndex].label}
          </h2>

          {renderStepContent()}

          <FormError message={formError} />

          <div className="sticky bottom-0 -mx-5 -mb-5 flex gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 sm:static sm:mx-0 sm:mb-0 sm:border-0 sm:px-0 sm:py-0">
            {!createdClassId ? (
              <Button
                type="button"
                variant="secondary"
                className="h-11 px-6 text-sm"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            ) : null}
            {isReviewStep ? (
              <AuthButton
                type="button"
                variant="primary"
                className="w-auto flex-1 text-sm"
                onClick={handleCreate}
                loading={isSubmitting}
                loadingLabel="Creating class…"
              >
                Create class
              </AuthButton>
            ) : isMaterialsStep ? (
              <div className="flex flex-1 flex-col gap-2">
                {uploadedMaterials.length === 0 ? (
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Upload at least one material to finish — your agents need it
                    to teach and answer questions for this class.
                  </span>
                ) : null}
                <Button
                  type="button"
                  variant="primary"
                  className="h-11 w-full text-sm"
                  onClick={handleFinish}
                  disabled={uploadedMaterials.length === 0}
                >
                  Finish
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="primary"
                className="h-11 flex-1 text-sm"
                onClick={handleContinue}
              >
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
