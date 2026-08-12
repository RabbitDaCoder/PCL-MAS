// Repeatable text list — used for both learning objectives (plain add/remove) and topics
// (add/remove + reorder), so the AI-context topic ordering has one shared, tested control.
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

export default function RepeatableTextList({
  label,
  helperText,
  items,
  onChange,
  addLabel = "+ Add item",
  itemPlaceholder = "",
  reorderable = false,
}) {
  function updateItem(index, value) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, ""]);
  }

  function moveItem(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const next = [...items];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[var(--color-text)]">
        {label}
      </span>
      {helperText ? (
        <p className="-mt-1 text-sm text-[var(--color-text-secondary)]">
          {helperText}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {reorderable ? (
              <span className="w-5 shrink-0 text-center text-sm text-[var(--color-text-secondary)]">
                {index + 1}
              </span>
            ) : null}
            <input
              type="text"
              value={item}
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder={itemPlaceholder}
              aria-label={`${label} ${index + 1}`}
              className="min-h-11 flex-1 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus-visible:border-[var(--color-text)]"
            />
            {reorderable ? (
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move item ${index + 1} up`}
                  className="flex h-5 w-8 items-center justify-center rounded-t-md text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move item ${index + 1} down`}
                  className="flex h-5 w-8 items-center justify-center rounded-b-md text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => removeItem(index)}
              aria-label={`Remove item ${index + 1}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="flex h-11 w-fit items-center gap-1.5 rounded-[10px] border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-hover)]"
      >
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}
