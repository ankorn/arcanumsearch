// App.tsx
import React, { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import "./index.css";

const queryClient = new QueryClient();

interface SearchResult {
  id: string;
  url: string;
  score: number;
  content: string;
  title: string;
}

interface SearchResponse {
  results: SearchResult[];
}

const API_URL = "https://mfphsrdubggjqxvyuzil.supabase.co/functions/v1/knn";
const API_KEY = "sb_publishable_XRNtK6CNXu6R2qOwelRE6w_SqIxMsVP";

function SearchApp() {
  const [query, setQuery] = useState("");

  const mutation = useMutation<SearchResponse, Error, string>({
    mutationFn: async (query: string) => {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: API_KEY,
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error(`Search failed: ${res.status} ${res.statusText}`);
      }

      return res.json();
    },
    retry: 2,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      mutation.mutate(query.trim());
    }
  };

  const isRetrying = mutation.isPending && mutation.failureCount > 0;

  return (
    <>
      <div className="arcanum-container">
        <header className="arcanum-header">
          <h1 className="arcanum-title">arcanumsearch</h1>
          <p className="arcanum-desc">
            cross-community search for{" "}
            <em>Arcanum: Of Steamworks and Magick Obscura</em>
          </p>
          <p className="arcanum-subdesc">
            quests, stats, patches, modes, bugs, formulas, calculators — all in
            one place
          </p>
        </header>

        <form onSubmit={handleSubmit} className="arcanum-form">
          <div className="input-wrapper">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search query"
              className="arcanum-input"
            />
            <button
              type="submit"
              disabled={mutation.isPending || !query.trim()}
              className="arcanum-button"
            >
              search
            </button>
          </div>
        </form>

        <div className="results-area">
          {mutation.isPending && (
            <div className="state-message loading">
              <div className="spinner" />
              <span>{isRetrying ? "retrying..." : "loading..."}</span>
            </div>
          )}

          {mutation.isError && (
            <div className="state-message error">
              <span className="error-icon">⚠</span>
              <span>{`search failed: ${mutation.error.message}, try again`}</span>
            </div>
          )}

          {mutation.isSuccess && mutation.data.results.length === 0 && (
            <div className="state-message empty">
              no relevant documents found
            </div>
          )}

          {mutation.isSuccess && mutation.data.results.length > 0 && (
            <ul className="results-list">
              {mutation.data.results.slice(0, 5).map((result, idx) => (
                <li key={result.id} className="result-item">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="result-link"
                  >
                    <span className="result-rank">{idx + 1}</span>
                    <span className="result-title">{result.title}</span>
                    <span className="result-arrow">→</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <footer className="arcanum-footer">
        <a
          href="https://github.com/ankorn/arcanumsearch"
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </a>
        <span className="footer-sep">·</span>
        <a
          href="https://huggingface.co/pameydorke/arcanum-cross-platform-retriever"
          target="_blank"
          rel="noopener noreferrer"
        >
          huggingface
        </a>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SearchApp />
    </QueryClientProvider>
  );
}
