import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { client } from "@gradio/client";

const EMBEDDING_MODEL = "pameydorke/arcanumsearch";
const RERANKER_MODEL = "pameydorke/arcanumchat-reranker";

const MATCH_THRESHOLD = 0.3;
const KNN_LIMIT = 10;
const TOP_K = 5;

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isGpuUnavailable(error: unknown): boolean {
  return /No GPU was available|GPU.*unavailable/i.test(toErrorMessage(error));
}

function unwrapSingleOutput<T>(data: unknown): T {
  if (!Array.isArray(data) || data.length !== 1) {
    throw new Error(
      `Expected exactly one Gradio output, got: ${JSON.stringify(data).slice(0, 200)}`,
    );
  }
  return data[0] as T;
}

async function getEmbedding(query: string): Promise<number[]> {
  const app = await client(EMBEDDING_MODEL);
  const result = await app.predict("/embed_query", [query]);

  let out = unwrapSingleOutput<unknown>(result.data);
  // tolerate the endpoint returning [[...]] for a single query
  if (Array.isArray(out) && Array.isArray(out[0])) out = out[0];

  if (
    !Array.isArray(out) ||
    out.length === 0 ||
    !out.every((n) => typeof n === "number" && Number.isFinite(n))
  ) {
    throw new Error(
      `Embedding endpoint returned an invalid vector: ${JSON.stringify(out).slice(0, 200)}`,
    );
  }
  return out as number[];
}

// pairs: [[query, document], ...]
async function getRerankerIndices(
  pairs: Array<[string, string]>,
): Promise<number[]> {
  if (pairs.length === 0) return [];

  const app = await client(RERANKER_MODEL);

  const result = await app.predict("/predict", [JSON.stringify(pairs)]);

  const out = unwrapSingleOutput<unknown>(result.data);

  if (out && typeof out === "object" && "error" in out) {
    throw new Error(`Reranker error: ${(out as { error: unknown }).error}`);
  }

  if (!Array.isArray(out) || !out.every((i) => Number.isInteger(i))) {
    throw new Error(
      `Reranker returned unexpected payload: ${JSON.stringify(out).slice(0, 200)}`,
    );
  }

  const indices = out as number[];
  for (const i of indices) {
    if (i < 0 || i >= pairs.length) {
      throw new Error(`Reranker returned out-of-range index ${i}`);
    }
  }

  return indices;
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    const { query } = await req.json();

    if (typeof query !== "string" || query.trim() === "") {
      return Response.json(
        { error: "Please provide a query param!" },
        { status: 400 },
      );
    }

    let embedding: number[];
    try {
      embedding = await getEmbedding(query);
    } catch (error) {
      console.error("Failed to get embeddings:", error);
      return Response.json(
        { error: toErrorMessage(error) },
        { status: isGpuUnavailable(error) ? 503 : 500 },
      );
    }

    // @ts-expect-error
    const { data, error } = await ctx.supabase.rpc("knn", {
      query_embedding: embedding,
      match_threshold: MATCH_THRESHOLD,
      match_count: KNN_LIMIT,
    });

    if (error) {
      console.error("Failed to get relevant documents:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    const docs = (data ?? []) as Array<{
      content: string;
      id: number;
      similarity: number;
      title: string;
      url: string;
    }>;

    if (docs.length === 0) {
      return Response.json({ results: [] });
    }

    const pairs = docs.map((d) => [query, d.content] as [string, string]);

    let indices: number[];
    try {
      indices = await getRerankerIndices(pairs);
    } catch (error) {
      console.error("Failed to get reranker indices:", error);
      return Response.json(
        { error: toErrorMessage(error) },
        { status: isGpuUnavailable(error) ? 503 : 500 },
      );
    }

    const rerankedDocs = indices.slice(0, TOP_K).map((i) => {
      const { similarity, ...doc } = docs[i];
      return doc;
    });

    return Response.json({ results: rerankedDocs });
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/knn' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"query":"azram"}'

*/
