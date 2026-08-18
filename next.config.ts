import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import "./src/env";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default withNextIntl(nextConfig);
