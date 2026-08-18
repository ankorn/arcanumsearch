import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { client } from "@gradio/client";

async function getEmbedding(query: string) {
  const app = await client("pameydorke/arcanumsearch");
  const result = await app.predict("/embed_query", [query]);
  return result.data as number[];
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    const { query } = await req.json();

    if (!query)
      return Response.json(
        { error: "Please provide a query param!" },
        { status: 400 },
      );

    let embeddings: number[] | undefined;
    try {
      embeddings = await getEmbedding(query);
    } catch (error) {
      console.error("Failed to get embeddings:", error);

      if (typeof error === "string" && error.includes("No GPU was available")) {
        return Response.json({ error }, { status: 503 });
      }

      return Response.json({ error }, { status: 500 });
    }

    // @ts-expect-error
    const { data, error } = await ctx.supabase.rpc("knn", {
      query_embedding: embeddings?.[0],
      match_threshold: 0.3,
    });

    if (error) {
      console.error("Failed to get relevant documents:", error);
      return Response.json({ error: error?.message }, { status: 500 });
    }

    return Response.json({ results: data });
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/knn' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"query":"azram"}'

*/
