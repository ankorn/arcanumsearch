# arcanumsearch

semantic search of quests of Arcanum: Of Steamworks and Magick Obscura

[dataset](https://huggingface.co/datasets/pameydorke/arcanum-quests-queries-synthetic-v2)

[model](https://huggingface.co/pameydorke/arcanum-quests-retriever-v2)

## tasks

#### scraping

- [x] scraping arcanum.fandom.com/api.php

#### synthetic data

- [x] generation using 7b qwen
  - [x] (bug) keeps generating after json: stop_strings
  - [x] (bug) generates queries which requeire knowing internal logic of a quest("how can I get 1700 experience?"): added stop words inluding "experience" to the prompt
  - [x] (bug) generates more then k queries: fixed by prompt enginnering and using 14b model
  - [x] (bug) generates queries based on uselees info(Notes, Walkthrough, Part 1): removed useless titles from enhanced_document_text
  - [x] (bug) includes word "Arcanum" and it's misspellings: removed name of the game from prompt

#### retriever training

- [x] train a model based on BAAI/bge-m3 using MultipleNegativesRankingLoss
- [x] compare MultipleNegativesRankingLoss и GISTEmbedLoss
  - [x] MultipleNegativesRankingLoss
  - [x] GISTEmbedLoss with temperature 0.01 and BAAI/bge-m3 as guide model
  - result: GISTEmbedLoss gives best recall@k, but slower and more memory consuming
- [x] получить hard negatives с помощью обученной модели
- [x] train a model on hard negatives
  - [x] get hard negatives: for each query only one hard negative and only one epoch, bacause model seems to suffer from catastrophic forgetting(loss on hard negatives improves, but all metrics decrease)
- [x] (bug) quest text do not include important meta information(e.g. that it is a skill quest aor main quest)
  - [x] prepend section with quest info
- [x] (bug) 'arcanum', 'steamwords', 'arkanum', 'num' in queries
  - regexp did not work: too many variations
  - [x] remove prompt line '...You are a player of the RPG game "Arcanum'
- [x] (bug) vague queries are too vague: hard to find relevant document even for me
  - [x] prompt engineering did not work
  - [x] switched to 14 b qwen: recall@5 0.9 => 0.96; no too vague queries

#### inference

- [x] (bug) duplicates of documents: removed duplicates
- [ ] (bug): 228 enhanced_documents, not 229

#### evaluation

- [ ] write 200 queries yourself, eval(one query that wiki website handles, one that not)
