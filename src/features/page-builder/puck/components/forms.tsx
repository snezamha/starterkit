import type { ReactNode } from "react";

import { linkPickerField } from "@/features/page-builder/puck/fields/link-picker";
import { sanitizeLinkUrl } from "@/features/page-builder/puck/safety";
import type { PuckRenderProps } from "@/features/page-builder/puck/render-types";
import { HoneypotForm } from "@/features/page-builder/puck/components/forms-client";

type Slot = () => ReactNode;
type FormProps = PuckRenderProps & {
  title?: string;
  description?: string;
  submitLabel?: string;
  actionUrl?: string;
  content?: Slot;
};
type InputFieldProps = PuckRenderProps & {
  label?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
};
type TextareaFieldProps = PuckRenderProps & {
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
};
type SelectOption = { label: string; value: string };
type SelectFieldProps = PuckRenderProps & {
  label?: string;
  name?: string;
  required?: boolean;
  options?: SelectOption[];
};
type CheckboxFieldProps = PuckRenderProps & {
  label?: string;
  name?: string;
  required?: boolean;
};

const fieldLabelClass = "text-foreground grid gap-2 text-sm font-medium";
const fieldInputClass =
  "border-border bg-background rounded-[var(--radius-md)] border px-3 py-2 text-sm";

export const formComponents = {
  Form: {
    label: "Form",
    fields: {
      title: { type: "text" as const, contentEditable: true },
      description: { type: "textarea" as const, contentEditable: true },
      submitLabel: { type: "text" as const, contentEditable: true },
      actionUrl: linkPickerField,
      content: { type: "slot" as const },
    },
    defaultProps: {
      title: "",
      description: "",
      submitLabel: "Submit",
      actionUrl: "",
    },
    render: (props: FormProps) => {
      const {
        title,
        description,
        submitLabel = "Submit",
        actionUrl = "",
        content,
        puck,
      } = props;
      const action = sanitizeLinkUrl(actionUrl);

      return (
        <div className="mx-auto max-w-2xl space-y-6">
          {(title || description) && (
            <div className="space-y-2 text-center">
              {title ? (
                <h2 className="text-foreground text-3xl font-bold">{title}</h2>
              ) : null}
              {description ? (
                <p className="text-muted-foreground">{description}</p>
              ) : null}
            </div>
          )}
          <HoneypotForm action={action || undefined} className="space-y-4">
            {content?.()}
            <button
              type="submit"
              disabled={!action}
              className="bg-primary text-primary-foreground rounded-[var(--radius-md)] px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitLabel}
            </button>
            {!action && puck.isEditing ? (
              <p className="text-muted-foreground text-xs">
                Set a form action URL to enable submission.
              </p>
            ) : null}
          </HoneypotForm>
        </div>
      );
    },
  },

  InputField: {
    label: "Input",
    fields: {
      label: { type: "text" as const, contentEditable: true },
      name: { type: "text" as const },
      type: {
        type: "select" as const,
        options: [
          { label: "Text", value: "text" },
          { label: "Email", value: "email" },
          { label: "Phone", value: "tel" },
          { label: "Number", value: "number" },
        ],
      },
      placeholder: { type: "text" as const },
      required: {
        type: "radio" as const,
        options: [
          { label: "No", value: false },
          { label: "Yes", value: true },
        ],
      },
    },
    defaultProps: {
      label: "Name",
      name: "name",
      type: "text",
      placeholder: "",
      required: true,
    },
    render: (props: InputFieldProps) => {
      const {
        label = "Field",
        name = "field",
        type = "text",
        placeholder = "",
        required = false,
      } = props;

      return (
        <label className={fieldLabelClass}>
          {label}
          <input
            name={name}
            type={type}
            placeholder={placeholder || undefined}
            required={required}
            dir={type === "email" || type === "tel" ? "ltr" : undefined}
            className={fieldInputClass}
          />
        </label>
      );
    },
  },

  TextareaField: {
    label: "Textarea",
    fields: {
      label: { type: "text" as const, contentEditable: true },
      name: { type: "text" as const },
      placeholder: { type: "text" as const },
      required: {
        type: "radio" as const,
        options: [
          { label: "No", value: false },
          { label: "Yes", value: true },
        ],
      },
      rows: {
        type: "number" as const,
        min: 2,
        max: 12,
      },
    },
    defaultProps: {
      label: "Message",
      name: "message",
      placeholder: "",
      required: true,
      rows: 5,
    },
    render: (props: TextareaFieldProps) => {
      const {
        label = "Message",
        name = "message",
        placeholder = "",
        required = false,
        rows = 5,
      } = props;

      return (
        <label className={fieldLabelClass}>
          {label}
          <textarea
            name={name}
            placeholder={placeholder || undefined}
            required={required}
            rows={rows}
            className={fieldInputClass}
          />
        </label>
      );
    },
  },

  SelectField: {
    label: "Select",
    fields: {
      label: { type: "text" as const, contentEditable: true },
      name: { type: "text" as const },
      required: {
        type: "radio" as const,
        options: [
          { label: "No", value: false },
          { label: "Yes", value: true },
        ],
      },
      options: {
        type: "array" as const,
        arrayFields: {
          label: { type: "text" as const },
          value: { type: "text" as const },
        },
        getItemSummary: (item: SelectOption) => item.label || "Option",
        defaultItemProps: { label: "Option", value: "option" },
      },
    },
    defaultProps: {
      label: "Topic",
      name: "topic",
      required: false,
      options: [
        { label: "General", value: "general" },
        { label: "Support", value: "support" },
      ],
    },
    render: (props: SelectFieldProps) => {
      const {
        label = "Field",
        name = "field",
        required = false,
        options = [],
      } = props;

      return (
        <label className={fieldLabelClass}>
          {label}
          <select name={name} required={required} className={fieldInputClass}>
            {options.map((option, i) => (
              <option key={i} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      );
    },
  },

  CheckboxField: {
    label: "Checkbox",
    fields: {
      label: { type: "text" as const, contentEditable: true },
      name: { type: "text" as const },
      required: {
        type: "radio" as const,
        options: [
          { label: "No", value: false },
          { label: "Yes", value: true },
        ],
      },
    },
    defaultProps: {
      label: "I agree to the terms",
      name: "agree",
      required: false,
    },
    render: (props: CheckboxFieldProps) => {
      const { label = "Checkbox", name = "checkbox", required = false } = props;

      return (
        <label className="text-foreground flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name={name}
            required={required}
            className="border-border size-4 rounded"
          />
          {label}
        </label>
      );
    },
  },
};
