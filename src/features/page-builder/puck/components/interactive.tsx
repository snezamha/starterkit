import type { ReactNode } from "react";

import type { PuckRenderProps } from "@/features/page-builder/puck/render-types";

import { TabsClient } from "@/features/page-builder/puck/components/interactive-client";

type Slot = () => ReactNode;
type TabsProps = PuckRenderProps & {
  count?: number;
  tab1Label?: string;
  tab2Label?: string;
  tab3Label?: string;
  tab4Label?: string;
  tab1Content?: Slot;
  tab2Content?: Slot;
  tab3Content?: Slot;
  tab4Content?: Slot;
};

export const interactiveComponents = {
  Tabs: {
    label: "Tabs",
    fields: {
      count: {
        type: "radio" as const,
        options: [
          { label: "2", value: 2 },
          { label: "3", value: 3 },
          { label: "4", value: 4 },
        ],
      },
      tab1Label: { type: "text" as const, contentEditable: true },
      tab1Content: { type: "slot" as const },
      tab2Label: { type: "text" as const, contentEditable: true },
      tab2Content: { type: "slot" as const },
      tab3Label: { type: "text" as const, contentEditable: true },
      tab3Content: { type: "slot" as const },
      tab4Label: { type: "text" as const, contentEditable: true },
      tab4Content: { type: "slot" as const },
    },
    defaultProps: {
      count: 2,
      tab1Label: "Tab 1",
      tab2Label: "Tab 2",
      tab3Label: "Tab 3",
      tab4Label: "Tab 4",
    },
    render: (props: TabsProps) => {
      const {
        count = 2,
        tab1Label = "Tab 1",
        tab2Label = "Tab 2",
        tab3Label = "Tab 3",
        tab4Label = "Tab 4",
        tab1Content,
        tab2Content,
        tab3Content,
        tab4Content,
      } = props;
      const tabCount = Number(count);
      const allTabs = [
        { label: tab1Label, content: tab1Content?.() },
        { label: tab2Label, content: tab2Content?.() },
        { label: tab3Label, content: tab3Content?.() },
        { label: tab4Label, content: tab4Content?.() },
      ];

      return <TabsClient tabs={allTabs.slice(0, tabCount)} />;
    },
  },
};
