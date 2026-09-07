// Step 2 — Course Details: description, learning objectives, topics/syllabus (reorderable —
// order matters here since it feeds the AI learning system as structured context later).
import TextareaField from "../TextareaField";
import RepeatableTextList from "../RepeatableTextList";

export default function StepCourseDetails({ values, setValue }) {
  return (
    <div className="flex flex-col gap-6">
      <TextareaField
        label="Description"
        placeholder="What will students learn in this class?"
        value={values.description}
        onChange={(event) => setValue("description", event.target.value)}
        rows={4}
      />
      <RepeatableTextList
        label="Learning objectives"
        helperText="What should students be able to do by the end of this class?"
        items={values.learningObjectives}
        onChange={(next) => setValue("learningObjectives", next)}
        addLabel="+ Add objective"
        itemPlaceholder="Understand fundamental programming concepts"
      />
      <RepeatableTextList
        label="Topics / syllabus"
        helperText="Add topics in the order you'll teach them."
        items={values.topics}
        onChange={(next) => setValue("topics", next)}
        addLabel="+ Add topic"
        itemPlaceholder="Introduction to Programming"
        reorderable
      />
      <TextareaField
        label="Instructions for your AI agents"
        helperText="Private — students never see this. Tone, grading leniency, what the agents should answer directly vs. defer to you on, anything they should avoid."
        placeholder="e.g. Be encouraging with beginners. If a question is about grading disputes or extensions, don't answer it yourself — tell the student you'll pass it to me."
        value={values.aiInstructions}
        onChange={(event) => setValue("aiInstructions", event.target.value)}
        rows={4}
      />
    </div>
  );
}
