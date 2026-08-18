import "server-only";

import { UTApi, UTFile } from "uploadthing/server";

let client: UTApi | null = null;

function getClient(): UTApi {
  if (!process.env.UPLOADTHING_TOKEN) {
    throw new Error("UPLOADTHING_TOKEN is not set");
  }

  client ??= new UTApi();

  return client;
}

export async function deleteStoredFile(key: string): Promise<void> {
  await getClient().deleteFiles(key);
}

export async function uploadStoredFile(
  filename: string,
  data: Uint8Array,
  contentType: string,
): Promise<{ key: string; url: string; size: number }> {
  const file = new UTFile([data as BlobPart], filename, { type: contentType });
  const result = await getClient().uploadFiles(file);

  if (result.error || !result.data) {
    throw new Error(result.error?.message ?? "Upload failed");
  }

  return {
    key: result.data.key,
    url: result.data.ufsUrl,
    size: result.data.size,
  };
}
