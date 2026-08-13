// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { InferenceClient } from "@huggingface/inference";

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    // Called by another service with a secret key
    // ctx.supabaseAdmin bypasses RLS — use for privileged operations
    /*
    if (ctx.authMode === "secret") {
      const { user_id } = await req.json();
      const { data } = await ctx.supabaseAdmin.auth.admin.getUserById(user_id);

      return Response.json({
        email: data?.user?.email,
      });
    }
    */

    const { query } = await req.json();

    if (!query)
      return Response.json(
        { error: "Please provide a query param!" },
        { status: 400 },
      );

    const client = new InferenceClient(
      Deno.env.get("HUGGING_FACE_ACCESS_TOKEN"),
    );

    let embedding: number[] | undefined;
    try {
      embedding = (await client.featureExtraction({
        model: "BAAI/bge-m3",
        // model: "pameydorke/arcanum-cross-platform-retriever",
        inputs: query,
        text: query,
      })) as number[];
    } catch (error) {
      console.error("Failed to get embedding:", error);
    }

    // @ts-expect-error
    const { data, error } = await ctx.supabase.rpc("knn", {
      query_embedding: embedding,
      match_threshold: -100,
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
    --data '{"name":"Functions"}'

*/
