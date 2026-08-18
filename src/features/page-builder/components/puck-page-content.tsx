import type { Config, Data } from "@puckeditor/core";
import { Render } from "@puckeditor/core/rsc";

import { normalizePuckData } from "@/features/page-builder/puck/data";
import { puckConfig } from "@/features/page-builder/puck/config";
import type { Locale } from "@/i18n/config";
import { getPuckMetadata } from "@/features/page-builder/puck/localization";

type Props = {
  data: unknown;
  locale: Locale;
};

export function PuckPageContent({ data, locale }: Props) {
  const puckData = normalizePuckData(data);

  if (puckData.content.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Render
        config={puckConfig as Config}
        data={puckData as Data}
        metadata={getPuckMetadata(locale)}
      />
    </div>
  );
}
