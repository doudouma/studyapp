---
title: 100 Questions About RAG
summary: From architecture, parsing, chunking, embeddings and vector stores to retrieval, reranking, hallucination diagnosis, evaluation, cost, multimodality and GraphRAG — 100 questions on making RAG work in production.
tags: [RAG, Retrieval-Augmented Generation, Vector Database, GraphRAG, Topic Guide]
author: 100mini Editorial
publishedAt: 2026-11-02
updatedAt: 2026-11-02
questionCount: 100
chapterCount: 10
facts:
  - key: Author
    value: 100mini Editorial
  - key: Questions
    value: 100
    highlight: true
  - key: Chapters
    value: 10
  - key: Topic
    value: RAG / retrieval-augmented generation
  - key: For
    value: AI engineers / data and platform teams / RAG builders
  - key: Updated
    value: 2026-11-02
---

## Preface

This is a "100 questions" guide: a way to split a large topic into questions, then read it one question at a time.

RAG is not "attach a vector database." What decides quality is an engineering chain: parsing, chunking, hybrid retrieval, reranking, generation constraints, evaluation and cost control. Any weak link shows up as hallucination or an answer that misses the question.

The guide follows ten stages: architecture, parsing and indexing, chunking, embeddings and vector stores, retrieval and reranking, generation and hallucination, evaluation and observability, production cost, multimodality and GraphRAG, then trends and disputes.

**Quick answers**

- Treat RAG as a retrieval-systems problem, not a model plugin.
- Pure vectors are not enough: BM25 + dense + reranker is the production baseline.
- Chunk by document structure, not one fixed size for everything.
- Evaluate in layers: recall, reranking, faithfulness and end-to-end quality.
- "RAG is dead" refers to the laziest implementation, not the paradigm of fetching evidence on demand.

> Compiled from RAG source Q&A and public references, restructured and edited for this site.

> This is an edited edition: the original questions come from first-hand community discussions; the body favors an actionable list with concise answers.

## 1. Architecture and Pipelines

### 1. If I can just drop a PDF into ChatGPT, why bother with RAG?

Dropping a PDF in is a one-off context stuff. RAG keeps knowledge in an external index and fetches on demand, so it can update, cite sources, handle far more than a window, and avoid uploading sensitive documents.

For long-lived, multi-user, compliance-bound and cost-sensitive work, a controlled RAG stack is usually the better fit.

### 2. Agentic RAG vs traditional RAG — which are you actually using?

Traditional RAG is a single retrieve-assemble-generate pipeline. Agentic RAG lets the model rewrite queries, choose tools, iterate and self-correct before answering.

Use traditional RAG for narrow, single-source, high-frequency questions; use agentic retrieval for multi-hop reasoning, multiple data sources, or when the next step depends on intermediate results.

### 3. RAG vs fine-tuning vs AI agents — who wins in 2026?

They are complementary layers, not mutually exclusive. Fine-tuning fixes style and domain behavior into weights; RAG supplies fresh, verifiable facts; agents orchestrate tools and steps.

The mainstream pattern is RAG + agents: the agent decides when and what to retrieve, RAG supplies evidence, and fine-tuning is added only for stable data and extreme latency or cost needs.

### 4. How does Apple's CLaRa end-to-end compressed-document framework compare with Llama-3 + Qdrant?

CLaRa compresses documents into continuous latent representations and jointly trains retrieval and generation, reporting 32x–64x compression.

It is not the same layer as Qdrant: one is a model/training paradigm, the other a vector database. It remains research-grade; production still runs embeddings + vector store + reranker.

### 5. Should companies stop applauding vanilla RAG, and what does vanilla RAG lack?

Vanilla RAG is embedding query, top-k recall, stuff into prompt. It fails on vague queries, large corpora, and answers that span multiple passages.

It lacks query rewriting, structure-aware chunking, hybrid retrieval, reranking, metadata filters and post-retrieval validation. Upgrade to advanced or modular RAG and treat evaluation as first-class.

### 6. Why should RAG not be equated with memory?

RAG is read-only retrieval over a static index: it does not learn new facts, revise old ones, or forget expired content. Memory is persistent, mutable state with a lifecycle.

Separate knowledge retrieval from state evolution; when new facts matter, pair RAG with a writable memory layer or rebuild the index regularly.

### 7. How does RAG evolve from naive to four-stage agentic retrieval?

Naive RAG (single recall) → advanced RAG (hybrid retrieval, reranking, query rewriting) → modular RAG (composable query engines and routing) → agentic retrieval (tools, sub-query planning, iteration and correction).

The key is giving the model retrieval tools and the judgment of when to search again, trading controlled latency and cost for better retrieval quality.

### 8. Why did Claude Code move from RAG + local vectors to agentic search?

Code is a highly structured symbol system: answers depend on exact function names, class names, imports and file relationships, where embeddings are weak.

grep/glob/read navigate by directory and exact strings, which is more accurate and explainable. The lesson is to match retrieval to data shape: prose for RAG, code often for file tools.

### 9. "RAG is dead" is not about the same RAG — only one-shot vector retrieval died, right?

Mostly. The strawman being attacked is embedding + top-k; modern practice is sparse + dense hybrid retrieval, reranking, and retrieval exposed as agent tools.

What died is the laziest implementation, not the paradigm of retrieval-augmented generation.

### 10. Static retrieval is being replaced by living knowledge graphs — is RAG just transitional?

The more likely future is convergence: an evolvable knowledge layer persists relationships and cross-references, while RAG remains the evidence substrate for generation.

On-demand evidence, provenance and easy updates remain essential in any dynamic knowledge system. RAG evolves rather than disappears.

### 11. RAG is becoming an engineering discipline — should evaluation move from "best answer" to coverage, diversity and relevance?

Yes. RAG has moved from "wire up a vector store" to an engineering discipline covering chunking, hybrid retrieval, reranking, evaluation and observability.

Beyond answer correctness, measure recall coverage, diversity and query relevance, because retrieval quality sets the ceiling for generation.

### 12. Will agentic search models such as SID-1 replace RAG?

No; they change how the retrieval step is done. SID-1-style models run a query-rewrite, retrieve and rerank loop, but still need an index or vector backend.

They replace hand-assembled embed + rerank chains, not the retrieval-augmented architecture.

### 13. I built a LangChain RAG + SQL agent, then long-context models could read PDFs directly. Are frameworks doomed to be glue?

Long-context models handle one-off, single-document tasks, making frameworks look redundant in simple cases.

Production still needs multi-tool routing, evaluation, observability, caching, guardrails, permissions and cross-source orchestration. The issue is choosing the right abstraction level, not whether frameworks are useless.

## 2. Document Parsing and Indexing

### 14. How do I index 40,000 PDFs averaging 100 pages with the best cost-performance?

Layer parsing before optimizing cost: extract native-text PDFs with PyMuPDF/pdfplumber and keep layout coordinates; OCR only scans; use Marker/LlamaParse for tables and figures.

At four million pages, use batch ingestion, a self-hostable vector store and hybrid retrieval. Caption images with a VLM before embedding, and cache intermediate artifacts.

### 15. Building RAG for a rocket research company with scanned figures and formulas — how should visuals be handled and OCR failures fixed?

For decades-old scans, OCR failure is normal. Use OCR plus fallback validation: preprocess, let a VLM interpret low-confidence regions and diagrams, and keep formulas as both LaTeX and images.

Chunk figures, tables and formulas, then embed them multimodally or as structured descriptions, with metadata linking caption, section and body text.

### 16. With 10K+ NASA documents, how do I stitch multi-page tables without losing data?

Merge by layout logic, not by page. Use layout detection or a layout-aware parser to identify table boundaries across pages and output a merged Markdown/HTML table.

Do not embed fragments separately; keep the whole table as one unit or record "table N spans pages a–b" in metadata for reconstruction.

### 17. Why is fixed-size chunking basically wrong at enterprise scale, and how should query complexity set retrieval depth?

Fixed-size chunking cuts semantic boundaries and glues unrelated paragraphs together, adding retrieval noise.

Chunk by headings, sections, paragraphs and tables, with sentence-window or parent-child strategies. Simple fact questions use single-hop vector search; multi-hop and cross-section reasoning need hierarchy or auto-merge.

### 18. Enterprise documents are wildly varied — how should they be parsed correctly?

Do not hand-write fragile regexes. Use mature parsers: unstructured for many formats, LlamaParse for complex layouts and tables, Marker for a speed/quality balance.

Build a common "document → normalized intermediate representation" abstraction, route by layout, and add rules or human labels only for high-failure formats.

### 19. How do I choose embeddings for PDFs with text, images and tables?

No single embedding covers all three modalities. Use a combination: convert text and tables to structured text and embed with a general text model; caption images with a VLM or use multimodal embeddings.

Then add dense + sparse hybrid retrieval and a reranker, so semantic similarity and exact keyword matching are both covered.

### 20. For 40 product PDFs with tables and diagrams, is visual RAG worth the complexity, and ChromaDB or Pinecone?

At 40 documents, complexity is mostly parsing, not the vector store. Parse tables and diagrams into structured text plus captions; text indexes cover most queries.

Chroma is enough for small, local, zero-cost starts; Pinecone is easier for managed scaling. For German/French, multilingual embeddings matter more than the vector store choice.

### 21. How do I replace painful keyword search across 80,000 legal documents with semantic search/RAG?

Legal work needs term precision and provenance, so use hybrid retrieval: BM25 for article numbers and exact terms, dense vectors for paraphrase, then a reranker.

Keep clause hierarchy, section numbers and citations as metadata, return original citations, and use Qdrant or Elasticsearch for an integrated operational footprint.

### 22. Is OCR quality the hidden killer of RAG performance?

Yes. OCR errors distort entities, numbers and clause IDs, so embeddings and retrieval are built on noise, and attribution is hard.

Treat OCR as first-class: preprocess, choose a high-accuracy engine, validate and rerun low-confidence regions, store confidence metadata, and optionally pass the original image with the text.

### 23. Why is a managed retrieval layer better than assembling embedding + vector store + reranker for agents?

Agentic retrieval compounds errors across hops. Self-assembled components are hard to tune together, align on latency, and debug.

A managed layer packages late interaction, listwise reranking and agentic search behind one API, with version alignment and end-to-end observability.

### 24. Answers hide behind "see Appendix G" cross-references. Can structural navigation replace similarity search?

Not either/or; they complement. Parse the document into a hierarchy with explicit reference edges; retrieve candidate nodes by vector, then traverse references to gather context.

For manuals, regulations and papers with heavy cross-referencing, hierarchy/Graph RAG or agentic multi-hop retrieval is often more accurate than pure vectors.

### 25. On 2M+ pages, what are the key cleaning, chunking and optimization practices?

Cleaning: deduplicate with MinHash/SimHash, denoise, normalize encoding and language, strip headers and footers. Chunking: structure/semantic-aware plus parent-child, never one fixed size everywhere.

Optimization: batch and cache parsing and embedding, use hierarchical indexes and metadata pre-filters, hybrid retrieval with reranking, and offline recall monitoring. Scale demands horizontal vector stores and async ingestion.

## 3. Chunking Strategies

### 26. What is the best RAG stack today?

There is no universal best. The mainstream combination is hierarchical/semantic chunking, a domain-aligned dense embedding, BM25 + dense hybrid retrieval, a cross-encoder reranker, and LlamaIndex or LangGraph for orchestration.

Semantic chunking improves recall but adds latency and cost; production usually starts with hybrid + reranker, then upgrades chunking as needed.

### 27. What did testing different chunk sizes and retrievers show?

Chunk size is tightly coupled to the embedding model's best input length; 256–512 tokens is usually robust. Too small loses context, too large dilutes semantic focus.

Overlap (10–20%) helps boundary loss but adds index size. Hybrid almost always beats pure dense, and reranking usually adds more than further chunk-size tuning.

### 28. Why doesn't a large context window eliminate the need for chunking?

A large window answers "can the model read it"; chunking answers "can retrieval locate the right passage." Stuffing the corpus adds cost, noise and lost-in-the-middle.

Use small-chunk retrieval plus large-window generation, or auto-merge, instead of replacing retrieval with window size.

### 29. What is the biggest real obstacle in enterprise RAG?

Usually data engineering and evaluation, not the model: messy formats, chunking that breaks tables and cross-page references, and no reproducible eval set.

Other traps are one-size chunking, dense-only retrieval missing proper nouns, and subjective trial-and-error instead of continuous evaluation. Build the eval set and metadata filters first.

### 30. What do current RAG systems lack, and what blocks production deployment?

Observability, an evaluation loop and multi-step reasoning. Many demos have no query-level tracing, no golden set, and no answer for multi-hop or aggregation questions.

Production also struggles with unexplainable chunking, reranker cost, permissions and index freshness. Use tracing, regression tests and parent-child documents.

### 31. Why did some teams abandon embeddings for knowledge graphs and call chunking fundamentally broken?

Fixed chunking can split entity relationships and lose structured semantics; GraphRAG models entities and relations explicitly, which suits multi-hop and global questions.

But that is an extreme position. Chunking is not inherently broken; match it to usage. Production is usually vector plus graph/BM25, routed by question type.

## 4. Embeddings and Vector Stores

### 32. Which embedding models are best right now?

Closed APIs include Cohere embed-v4, Voyage voyage-3-large and OpenAI text-embedding-3-large; open models include BGE-M3, Qwen3-Embedding-8B, GTE-Qwen2 and NV-Embed-v2.

There is no single best. Choose by self-hosting, multilingual and multimodal needs and cost, then run an offline eval on your own corpus.

### 33. Pinecone's $50/month minimum broke my hobby project — what is the best self-hosted option on a $10 VPS?

Under a million vectors, start with Qdrant (Rust, single binary, strong filters and sparse vectors) or Chroma (Python-friendly for prototypes).

If data already lives in Postgres, pgvector adds zero extra ops. Go to Milvus/Weaviate or managed cloud beyond tens of millions of vectors or high concurrency.

### 34. What are the lessons from migrating off Pinecone?

Migration is an index-backend swap: keep the embedding model, move vectors and metadata, and verify recall on the same eval set.

pgvector fits existing Postgres, Qdrant is light self-hosting, Weaviate has native hybrid search, Milvus/Zilliz fits billion-scale, and Chroma fits prototypes. Measure scale and QPS before choosing.

### 35. For 10,000 research papers, how do I deal with Pinecone's namespace limit?

Ten thousand papers is a few hundred thousand chunks — small. Use pgvector or Qdrant with metadata fields (paper ID, author) instead of namespaces.

OpenSearch k-NN works if you are already deep in AWS but is heavier to operate; otherwise pgvector plus BM25 and vectors is the easiest path.

### 36. Can I encode documents as video frames instead of running a vector database?

Not recommended. It replaces vectors with a bulky medium that cannot be queried, filtered or updated without decoding.

For personal PDFs on 8GB, use LEANN's on-demand embedding recomputation, or single-node Qdrant/Chroma with BGE-M3/ColBERT. Optimize the index structure, not the storage medium.

### 37. Does text RAG really need a vector database, or is keyword search plus a small LLM enough?

Not always. For terminology-heavy corpora, BM25 with query rewriting can be enough, and is faster and cheaper.

Dense vectors win when paraphrase and semantic similarity dominate. Production usually uses hybrid retrieval; start with BM25 as a baseline, add vectors and a reranker when recall falls short.

### 38. What is the best stack for personal document AI search?

Optimize for lightweight, private and syncable: local Chroma or Qdrant, a self-hostable embedding such as BGE-M3, nomic-embed or Jina v3, or LEANN to shrink storage.

Sync the vector index and metadata with the document library, then run inference locally. Avoid heavy cloud options like Pinecone here.

### 39. LEANN's 97% storage saving costs 50–100x slower search — is that production-ready?

It fits when retrieval latency is not the bottleneck: personal RAG, long generation tasks, agent memory, with a fixed embedding model and infrequent writes.

It does not fit high-QPS multi-tenant SaaS, heavy write churn, or sub-50ms search UIs. Those need Milvus/Qdrant-style indexes.

### 40. What full RAG products exist beyond frameworks?

Managed options include Marqo, Weaviate Cloud, Zilliz Cloud, Supabase (pgvector + edge functions) and Pinecone ingestion.

Self-hosted all-in-one options include Quivr, Dify, AnythingLLM and RAGFlow. Choose by self-hosting, tenant isolation, and whether embeddings and rerankers are replaceable.

### 41. How do I choose an embedding model with an offline eval instead of faith?

Build a golden set of real queries and the documents or passages they should retrieve, index with each candidate, and compute Recall@k and MRR.

The set must reflect your real distribution, because rankings reverse by domain. Fix chunking and reranker, and vary only the embedding.

### 42. How do I measure embedding optimization with real queries and feedback?

Build a reproducible pipeline and compute Recall@k, Precision@k, MRR and nDCG on labeled query-document pairs. Use MRR for single answers and nDCG for graded relevance.

Feed real queries and click or adoption signals back into labels, put metrics in CI, and rerun on every model or chunk change. Keep retrieval metrics separate from final answer quality.

### 43. Is there an open-source Rust OLTP graph-vector database?

HelixDB is a Rust open-source graph-vector database aimed at agent memory plus vector retrieval. SurrealDB is another Rust multi-model option with vectors.

For one system covering graph traversal and vectors, try HelixDB/SurrealDB; at large scale and maturity requirements, a graph DB plus Qdrant is safer.

### 44. I want a portable vector database outside the cloud for agents — what should I choose?

Look for embeddable or single-node stores: Qdrant, Chroma, Milvus Lite, sqlite-vss and pgvector.

Agent memory should prefer local or edge-capable embedded stores with no external dependency, so memory is not locked to one cloud.

### 45. Is there a lightweight managed "memory layer" for agents?

Managed vector starters include Pinecone Serverless, Qdrant Cloud, Weaviate Cloud and Zilliz Cloud; agent-memory-specific options include mem0.

For edge agents, look at Cloudflare Vectorize and Upstash Vector. Decide by deployment location and whether you need mixed semantic and event memory.

## 5. Retrieval and Reranking

### 46. How does a reranker improve RAG, and when is it worth adding?

A reranker scores candidates after recall, compensating for bi-encoders that encode query and document independently and miss negation, qualifiers and complex logic.

Add it when "retrieved but irrelevant" is the bottleneck. If recall is already precise or the latency budget is tight, the extra 100–200ms may not pay off.

### 47. For finance and private-equity documents, which RAG framework with reranking preserves relevant context best?

The framework matters less than the stack: hybrid retrieval, a cross-encoder reranker, and strict metadata/ACL filtering. LlamaIndex, LangChain or a custom pipeline can all work.

Choose rerankers tuned for finance or code, add query rewriting and relevance gating, and run end-to-end regression on real financial queries.

### 48. I built hybrid search + Qdrant + Voyage + reranking — where do I optimize next?

Your base stack is right. Next work on recall and post-rerank handling: query rewriting, multi-query, HyDE, fusion weights between BM25 and dense, and whether chunking splits semantics.

Common mistakes are unchanging top-k, missing metadata filters, and stuffing every candidate into context. Label gold documents for real queries and quantify recall and faithfulness.

### 49. Does hybrid search with BGE-M3 + Qdrant actually improve retrieval quality?

Usually yes, especially with proper nouns, abbreviations, IDs and regulation codes: dense adds semantics, sparse adds exact term matching.

BGE-M3 outputs dense, sparse and multi-vector representations; Qdrant's RRF fusion is a mature combination. Fusion weights, recall k and reranking decide final quality.

### 50. Why do most RAG systems fail in production even with good embeddings?

Pure vector retrieval encodes query and document independently, compares overall similarity, misses exact keyword requirements, gets misled by similar-but-irrelevant long documents, and is insensitive to negation and qualifiers.

Fix it with hybrid retrieval, cross-encoder reranking, query rewriting, and pre/post-retrieval relevance gating — not just a stronger embedding.

### 51. How well does multi-model RAG (vector + graph) with LangChain work?

Vector + graph clearly helps global structure, entity relations and multi-hop reasoning, but adds little for local fact questions and is expensive to build and maintain.

Start with hybrid vectors + reranker, add graph only for real global or multi-hop needs, route by question type, and evaluate incremental gains on real queries.

### 52. Query rewriting, HyDE, multi-query, decomposition and routing — which actually improve recall?

Multi-query helps vague short queries by about 10–20%; HyDE fits terminology mismatch, around 5–15%; sub-query decomposition helps multi-hop most, up to 20–30%; step-back fits abstract questions; routing splits heterogeneous indexes.

The principle is to classify the query first. Simple precise queries should go straight to retrieval rather than paying for another LLM call.

### 53. How do I systematically fix hidden duplicates, vector overfetch and incomplete metadata filters?

On the write side, use deterministic chunk IDs plus content hashes, keep stable metadata (source, time, permissions, section path), and index it.

On the read side, deduplicate multi-route results at the document level, apply metadata filters before vector recall, then rerank and gate relevance. Measure duplicate rate, filter hit rate and faithfulness on real queries.

### 54. When is a reranker worth the latency and cost, and how do I prove it improved end-to-end answers?

Add it when answers miss because relevant documents were retrieved but ranked low, and the latency budget can absorb 100–200ms.

Prove it with regression: a real query set with gold documents and answers, comparing Recall@k, faithfulness, accuracy and latency with and without the reranker. If the gain is under 5% and latency-sensitive, use a lighter option.

### 55. RAG retrieves the right document but answers off-topic — is reranking being ignored?

That is a classic missing or failing reranker: relevant documents are pushed behind similar distractors, and the model only reads the first few.

Compare Recall@N and faithfulness before and after reranking. If gold documents are not recalled at all, reranking cannot save you; fix recall first.

### 56. Why is "stuff every retrieved chunk into context" not a strategy?

It adds noise, exceeds effective attention, and triggers lost-in-the-middle, diluting key information wherever it sits.

Treat recall as a candidate pool: retrieve a larger top-k, rerank down to Top-5/10, deduplicate and gate relevance, and send only high-signal passages.

### 57. Can a "semantic firewall" checking evidence coverage and drift before generation catch vector-store bugs?

It catches a good share of hallucinations caused by empty, corrupted or degraded recall by making silent failures explicit.

But it only mitigates bad retrieval; it cannot fix write or index bugs inside the vector store. Root fixes still need data validation, index health checks and regression evals.

## 6. Generation and Hallucination

### 58. RAG hallucinates in production — how do I tell whether retrieval or generation is at fault?

Isolate variables: inject the correct chunk directly with an oracle retriever. If the answer becomes correct, retrieval is at fault; if it still fails, generation is.

Then rerun the same recall with different prompts and models to separate ranking from instruction or parsing issues, and invest accordingly.

### 59. Why does RAG still hallucinate after retrieving the right document, and which side do I fix first?

Retrieval success does not guarantee reliable generation: lost-in-the-middle, conflicting instructions or overconfidence can still produce unsupported content.

If correct evidence is in the Top-k but unused, it is a generation or ranking problem; if it is absent, fix retrieval. Retrieval fixes are usually cheaper and higher-leverage.

### 60. If pasting the correct chunk into the prompt makes the model answer correctly, is it a retrieval problem?

Basically yes. Keep the same model, temperature and instructions as production and replace only the context; a correct answer points to recall or ranking.

If it still fails, generation or parsing is at fault. This is the oracle-retriever idea and should be a standing regression test.

### 61. How do oracle retriever and paraphrase replay separate hallucination from parsing failure?

The oracle retriever gives an ideal-recall upper bound to isolate generation. Paraphrase replay keeps the same evidence and only rewrites the question and instructions; if the answer flips, the prompt or parsing is fragile.

Together they attribute failure to retrieval, prompting, parsing or the model, and belong in CI so one fix does not mask another.

### 62. How do I systematically fix a RAG system that "feels bad"?

Build layered observability: retrieval sees contextual precision/recall, generation sees faithfulness and answer relevance, and the full chain sees end-to-end accuracy and latency.

Use RAGAs, TruLens or a custom judge on an offline set that includes unanswerable negatives, and rerun the same set on every change. Fix recall before generation.

### 63. As agents get more complex, is hallucination worse, and what reduces it long term?

Yes, multi-step agents compound errors across tool calls and context assembly, and long trajectories trigger lost-in-the-middle.

The durable approach is retrieval as constraint: every step is grounded in verifiable evidence, tools return structured results, and key decisions run faithfulness checks and citation tracing.

### 64. How do I compute "accuracy" for an agentic RAG system?

Do not score only the final answer. Break it into retrieval accuracy, tool-call accuracy, answer faithfulness and end-to-end task success, including the rate of confident wrong answers that should have been refusals.

Use a set with gold answers and gold evidence, combine LLM judges with human calibration, and report the components.

### 65. What are the advantages of SurrealDB doing vector + graph in one store over separate stores?

The main advantage is transactional consistency and simpler queries: relations and embeddings update atomically, avoiding drift and sync lag between two systems.

The trade-off is that very large pure-vector workloads may scale better in a dedicated vector DB, and tooling is less mature. Decide by scale and consistency needs.

### 66. What are the most common fatal failure modes in production RAG?

One is confident hallucination with no context: empty or insufficient evidence still produces an answer. Add an evidence-sufficiency gate that refuses or says so.

The other is stale retrieval: documents update but the index does not, returning expired facts. Add TTLs, versioning and change-triggered rebuilds.

## 7. Evaluation and Observability

### 67. Which RAG metrics should production use to avoid tuning by feel?

On retrieval, contextual precision and contextual recall show whether relevant chunks rank high and are all recalled.

On generation, faithfulness and no-answer rate. RAGAs standardizes these, and DeepEval can run regression assertions in CI with online monitoring.

### 68. How do I split RAG failures into data source, retrieval and generation layers?

At the data layer, check whether documents are missing, stale or mis-chunked. At retrieval, use recall@k and noise ratio to find missed or irrelevant chunks. At generation, use faithfulness to detect fabrication or ignored context.

First bypass retrieval with a golden context; if answers improve, the problem is retrieval, otherwise generation. Then drill down.

### 69. How do I trace a RAG error end-to-end from ingestion to synthesis?

Keep intermediate artifacts at every stage: document hash and parse output, chunk boundaries and metadata, recalled IDs and scores, final prompt and citations.

On replay, compare stage by stage: irrelevant recall means retrieval or chunking; correct context plus wrong answer means generation. Use Langfuse or Arize Phoenix for full traces.

### 70. What do hybrid retrieval, cross-encoder reranking, semantic caching and cost routing each solve?

Hybrid retrieval improves robustness, covering pure vectors' weakness on proper nouns and exact matches. Cross-encoder reranking fixes ordering and removes noisy chunks.

Semantic caching reuses answers for similar questions to cut latency and cost; cost routing sends simple requests to small models and reserves large models for hard ones.

### 71. How should the 2026 RAG evaluation stack be assembled to catch silent failures?

RAGAs/DeepEval run offline regression gates; TruLens scores online calls with feedback functions and alerts; LangSmith provides traces and human labels; Arize Phoenix tracks online drift and clustering.

Connect offline and online so low-scoring samples flow back into the eval set, catching degradation before users complain.

### 72. How does a semantic firewall use evidence coverage and drift scores to block bugs?

Insert a guard between retrieval and generation: evidence coverage checks whether each claim maps to a retrieved passage, and drift detects distribution shifts from contamination or document updates.

If coverage is below threshold or drift exceeds bounds, stop generation, return "no answer" or escalate to a human instead of outputting a likely-wrong answer.

### 73. After five months of local RAG, what failure modes were most surprising?

One is question-shaped headings hijacking retrieval: FAQ-style headings are highly similar to user queries and get recalled instead of the real body text.

The other is the retriever not seeing the previous answer in multi-turn chat, so stateful Q&A repeatedly misses context it already produced. Fix with heading weighting/exclusion and conversation memory injection.

## 8. Production and Cost

### 74. LLM/RAG costs jumped from $20 to $300 a month — how do I route across models at scale?

The spike usually comes from using one expensive model for everything. Classify requests with rules, a small classifier or a small model, send simple ones to cheap models, and escalate only hard reasoning.

Tools such as LiteLLM provide a gateway and fallback; RouteLLM does cost-quality routing; a custom classifier also works. Tooling is easier to observe and tune.

### 75. How do I model per-query cost, and why is agentic RAG 4–8x more expensive?

Break it down: embeddings are cheap, vector search is priced per query or storage, reranking scales with candidates and tokens, and LLM synthesis is usually the largest cost.

Agentic RAG multiplies retrieval, tool calls, reflection and planning, repeating embedding/rerank/LLM work. Route simple facts to naive RAG, enable agentic only for multi-hop, and add caching and candidate caps.

### 76. What are the main cost and latency levers from prototype to production?

Three levers: input tokens, by sending only necessary context; model tiering, using small models for routing and retrieval and matching generation tier to difficulty; and semantic caching for similar questions.

Add parallel retrieval, capped rerank candidates, and quantized or distilled embeddings to cut p95 latency and unit cost without obvious quality loss.

### 77. Memory grows and never releases in CrewAI/LangChain multi-step pipelines — is that a framework bug?

It is not unique to a framework; it is a long-chain agent trap: unreleased history and intermediates, closures holding large objects, piled-up async tasks and accumulated traces.

Give each step a lifecycle, use bounded buffers, hold state per request rather than per process, and add memory observability and circuit breakers. The root cause is reference management.

### 78. How much time do enterprise users spend searching documents, and why is search time the real RAG pain?

The real cost is not inference but the hours employees spend hunting and stitching scattered documents, plus the interruptions. RAG moves from "people find documents" to "answers find people."

Measure ROI as saved search hours times labor cost, not just token spend. Retrieval quality and coverage decide whether the business buys in.

### 79. Why do most RAG systems fail in production?

Three assumptions: retrieval quality is never measured before launch; chunking is treated as an implementation detail and fixed-size cuts semantics apart; and the context window is treated as a trash can.

Production needs continuous retrieval and end-to-end measurement, structure-aware chunking, and treating context as a scarce resource.

### 80. I don't want to build the RAG pipeline — are there fully managed RAG-as-a-Service options?

Yes. Ragie offers parsing, chunking, automatic indexing and built-in reranking, with native connectors to Google Drive, Notion and Confluence.

Other options include Pinecone, Voyage, Vertex AI RAG Engine and Azure AI Search. Managed saves ops but requires accepting data egress and usage billing; self-hosting gives more sovereignty and customization.

## 9. Multimodality and GraphRAG

### 81. Multimodal RAG at 200K+ documents with tables, Excel and charts — what works, what breaks, and why is it so expensive?

What works is layout-aware retrieval: colPali/ColQwen embed page images directly, combined with structured table and chart parsing, and clearly beat OCR + text chunking.

What breaks is cost: VLM feature extraction or OCR grows linearly or worse with document count, and multimodal indexes lack incremental updates. Layer by document type and cache aggressively.

### 82. Why did some teams abandon embeddings for knowledge graphs?

Dense vectors capture semantic similarity but struggle to express entity relations and multi-hop reasoning; arbitrary chunking also breaks cross-chunk relationships.

A knowledge graph parses documents into entities, relations and attributes, supports multi-hop traversal and provenance. But pure KG loses open semantic matching; the mainstream is graph + vector, and extraction and incremental maintenance are hard.

### 83. After building a GraphRAG-style pipeline, where do I go next?

Next is lower indexing cost and better retrieval: incremental extraction and community recomputation instead of full rebuilds, and HippoRAG-style graph plus personalized PageRank for query-time reasoning.

Then fuse graph and vector retrieval, add time, confidence and edge-level provenance, and quantify gains on multi-hop QA benchmarks.

### 84. Why is GraphRAG indexing "pay first, query cheap," and why is incremental update so hard?

GraphRAG is index-once, query-cheap: indexing repeatedly calls an LLM to extract entities and relations, generate descriptions and community summaries, inflating input tokens 5–10x over the source.

Incremental updates are hard because a new document can change global community partitions, and one change cascades into many summary recomputations. Entity dedup, impact scoping and incremental repartitioning only mitigate it.

### 85. Why do GraphRAG graphs contain hallucinated edges, and how do I make every edge defensible?

Hallucinated edges come from over-inference: forcing co-occurring entities into relationships, inventing attributes, or making implicit relations explicit.

Store the source chunk ID and quote for every edge, score confidence or support, filter weak edges, and return the evidence to the generator so the graph stays auditable.

### 86. A Chinese developer's GraphRAG/HippoRAG test found theory beautiful but practice painful — why is the multi-hop advantage unclear?

Many real enterprise questions are single-hop or local, so graph retrieval loses to plain vector RAG because of summary noise, extraction errors and community-selection bias.

Extraction cost, dependence on source structure and hard query routing add pain. Use hybrid retrieval with a classifier and enable graph only where cross-document reasoning is real.

### 87. Can vector retrieval and graph traversal run in parallel, using recursive SQL CTEs to recover relationships standard RAG misses?

Yes, and it is a strong hybrid pattern: run vector search and graph traversal for the same query in parallel, then fuse and rerank.

Recursive SQL CTEs express traversal well: seed from matched entities, use `WITH RECURSIVE` to expand along edges to a hop or depth limit, then send graph paths and vector chunks to the LLM together.

### 88. Can documents, chats and databases become one living, locally runnable knowledge graph?

That is what GraphRAG and living graphs aim at: parse multiple sources into an entity-relation graph, support incremental writes, and let multiple agents share structured memory and answer cross-document questions.

Use local LLM extraction plus a local graph database, with a common graph interface and permissions. The trade-off is incremental extraction and consistency maintenance.

### 89. Can documents automatically become a self-growing knowledge graph with provenance?

Yes, with an extract-merge-trace loop: new documents are parsed into entities and relations, aligned and disambiguated against the existing graph, nodes reused, and each edge's source recorded.

Retrieval returns paths and original evidence. Costs are extraction and alignment, and confidence thresholds suppress hallucinated edges; graph plus vector remains the ideal shape.

### 90. Is there a database combining knowledge graphs and vector search for multimodal data?

Yes. ApertureDB manages assets (images, video, audio, text) with metadata and vector indexes, and uses graph-style queries for cross-modal relations.

More broadly, multimodal RAG uses colPali for page or image embeddings, a vector store for similarity, and a graph or metadata layer to connect modalities.

### 91. What is SurrealDB like for vector + graph GraphRAG?

SurrealDB natively supports graph relations, vector indexes and mixed document/table models, so vector recall and graph traversal can share one transaction and reduce dual-system ops.

The trade-off is maturity versus Neo4j, Milvus or Qdrant; large-scale ANN performance and tuning guidance are still growing, so it fits prototypes and mid-scale.

## 10. Trends and Disputes

### 92. Are frameworks doomed now that LLMs read unstructured data directly?

Not doomed, but heavy wrappers are losing value. With native tool calling, structured output and file reading, glue that only assembles prompts is thinning.

Long-term value shifts from hiding API details to providing observable, composable retrieval and agent primitives. The industry is converging on lighter, more composable layers.

### 93. "RAG is dead, long live agentic retrieval" — hype or deep evolution?

Mostly rebranding, not technical death. RAG is moving from one-shot retrieve-assemble-generate to multi-step agentic retrieval with decisions and reflection.

The insight is valid: retrieval becomes a callable agent capability rather than a one-time preprocessing step. But it still relies on embeddings, vector stores, reranking and context compression.

### 94. Is "RAG evolved to be more human" a fair description?

Broadly yes. The direction includes stronger provenance, explainability, user-intent understanding and interactive clarification, instead of dumping text chunks into context.

But "more human" easily becomes a vague slogan. The verifiable progress is multi-turn retrieval, query rewriting, hybrid retrieval and human feedback loops.

### 95. For complex domain knowledge, why prefer agent search tools over storing context as Markdown/RAG?

The trade-off is pre-packaged context versus on-demand retrieval. Static Markdown wastes the window, introduces stale information, and drifts when knowledge changes.

Give the agent search and read tools so it fetches fresh passages, saving tokens and scaling better. Small, stable, high-frequency references can still be persisted.

### 96. Giving an agent Unix tools beats naive RAG by 17% on complex corpora — should files replace RAG?

The 17% beats naive chunk + top-k, not the RAG paradigm. grep is strong on exact keywords, structure and code, but lacks semantic generalization, cross-language matching and multimodality.

The stable architecture is both: vectors for semantic recall, file and keyword tools for exact fallback, coordinated by the agent.

### 97. The hard part of context engineering is deciding what to keep after 500 interactions — why can't vector stores solve it?

Vector stores solve similarity search. Context engineering is about state and importance decisions: which facts remain relevant, which expired, which conflict.

That is memory management and policy. It needs tiered memory, decay and update rules, and explicit retention policies; the vector store is only the retrieval component.

### 98. In long-running multi-agent projects, how do I maintain project memory and task state and verify subagents independently?

Decouple memory and state from execution: use structured task and state stores (issue/plan files, databases or a memory service) that subagents read and write with provenance.

Verification needs an independent layer: unit tests, static analysis, reviewer agents, and diff or assertion checks against requirements. Do not let agents sharing the same context self-certify.

### 99. Static retrieval is being replaced by living knowledge graphs — is RAG transitional?

Living graphs are an advanced evolution, but calling RAG merely transitional underestimates it as infrastructure.

Graphs are stronger for relation-dense, multi-hop questions, but cost more to build and maintain and are constrained by extraction hallucinations. The likely future is layered coexistence: vector RAG as a broad, cheap base; graphs as a high-value enhancement layer.

### 100. "RAG vs grep" is a cost curve, not a religious war — who is the ledger and who is the index?

The filesystem or database is the ledger and source of truth: authoritative, writable, versioned raw data. The vector store is an index and fast path, a derived structure that must be rebuildable from the ledger.

Small corpora are cheap with files + grep; vector indexes pay off as corpora grow and semantic needs rise. Let the ledger live in files and the index in vectors, with the agent scheduling between them.
