import {
  getResponsiveColumnsClass,
  responsiveColumnsField,
  type ResponsiveColumns,
} from "@/features/page-builder/puck/responsive";
import type { PuckRenderProps } from "@/features/page-builder/puck/render-types";

type StatItem = { value: string; label: string; description: string };
type StatsProps = PuckRenderProps & {
  items?: StatItem[];
  columns?: string;
  responsiveColumns?: Partial<ResponsiveColumns>;
  align?: string;
};

type AccordionItem = { question: string; answer: string };
type AccordionProps = PuckRenderProps & {
  items?: AccordionItem[];
  separated?: string;
  singleOpen?: boolean;
};

const statsColMap: Record<string, string> = {
  "2": "grid-cols-2",
  "3": "grid-cols-3",
  "4": "grid-cols-4",
};

export const dataBlockComponents = {
  Stats: {
    label: "Stats",
    fields: {
      items: {
        type: "array" as const,
        arrayFields: {
          value: { type: "text" as const, contentEditable: true },
          label: { type: "text" as const, contentEditable: true },
          description: { type: "text" as const, contentEditable: true },
        },
        getItemSummary: (item: StatItem) => item.label || item.value || "Stat",
        defaultItemProps: { value: "0", label: "Metric", description: "" },
      },
      columns: {
        type: "radio" as const,
        options: [
          { label: "2", value: "2" },
          { label: "3", value: "3" },
          { label: "4", value: "4" },
        ],
      },
      responsiveColumns: responsiveColumnsField,
      align: {
        type: "radio" as const,
        options: [
          { label: "Start", value: "start" },
          { label: "Center", value: "center" },
        ],
      },
    },
    defaultProps: {
      items: [
        { value: "10K+", label: "Users", description: "" },
        { value: "99.9%", label: "Uptime", description: "" },
        { value: "24/7", label: "Support", description: "" },
      ],
      columns: "3",
      responsiveColumns: { mobile: "1", tablet: "2", desktop: "3" },
      align: "center",
    },
    render: (props: StatsProps) => {
      const {
        items = [],
        columns = "3",
        responsiveColumns,
        align = "center",
      } = props;
      const colClass = responsiveColumns
        ? getResponsiveColumnsClass(responsiveColumns)
        : (statsColMap[columns] ?? "grid-cols-3");
      const alignClass = align === "center" ? "text-center" : "text-start";

      return (
        <div className={`grid ${colClass} gap-8`}>
          {items.map((item, i) => (
            <div key={i} className={alignClass}>
              <div className="text-foreground text-3xl font-bold tracking-tight">
                {item.value}
              </div>
              <div className="text-foreground font-medium mt-1">
                {item.label}
              </div>
              {item.description && (
                <div className="text-muted-foreground text-sm mt-1">
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    },
  },

  Accordion: {
    label: "Accordion / FAQ",
    fields: {
      items: {
        type: "array" as const,
        arrayFields: {
          question: { type: "text" as const, contentEditable: true },
          answer: { type: "textarea" as const, contentEditable: true },
        },
        getItemSummary: (item: AccordionItem) => item.question || "Question",
        defaultItemProps: { question: "Question", answer: "Answer" },
      },
      separated: {
        type: "radio" as const,
        options: [
          { label: "Bordered", value: "bordered" },
          { label: "Separated", value: "separated" },
        ],
      },
      singleOpen: {
        type: "radio" as const,
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
    defaultProps: {
      items: [
        {
          question: "What is this?",
          answer: "This is an accordion component.",
        },
        {
          question: "How does it work?",
          answer: "Click a question to expand or collapse the answer.",
        },
      ],
      separated: "bordered",
      singleOpen: false,
    },
    render: (props: AccordionProps) => {
      const { items = [], separated = "bordered", singleOpen = false } = props;

      if (separated === "separated") {
        return (
          <div className="space-y-3">
            {items.map((item, i) => (
              <details
                key={i}
                name={singleOpen ? `accordion-${props.id}` : undefined}
                className="group border border-border rounded-xl overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium text-foreground hover:bg-muted/50 transition-colors list-none">
                  <span>{item.question}</span>
                  <span className="text-muted-foreground ms-4 shrink-0 transition-transform group-open:rotate-180">
                    ↓
                  </span>
                </summary>
                <div className="px-5 pb-4 pt-0 text-muted-foreground text-sm leading-6 whitespace-pre-wrap">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        );
      }

      return (
        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
          {items.map((item, i) => (
            <details
              key={i}
              name={singleOpen ? `accordion-${props.id}` : undefined}
              className="group"
            >
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium text-foreground hover:bg-muted/50 transition-colors list-none">
                <span>{item.question}</span>
                <span className="text-muted-foreground ms-4 shrink-0 transition-transform group-open:rotate-180">
                  ↓
                </span>
              </summary>
              <div className="px-5 pb-4 text-muted-foreground text-sm leading-6 bg-muted/20 whitespace-pre-wrap">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      );
    },
  },
};
