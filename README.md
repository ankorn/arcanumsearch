# arcanumsearch

semantic search of quests of Arcanum: Of Steamworks and Magick Obscura

dataset: https://huggingface.co/datasets/pameydorke/arcanum-quests-queries-synthetic

model: https://huggingface.co/pameydorke/arcanum-quests-retriever-with-hard-negatives

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

- [x] обучить модель на основе BAAI/bge-m3
- [x] сравнить MultipleNegativesRankingLoss и GISTEmbedLoss
  - [x] MultipleNegativesRankingLoss
  - [x] GISTEmbedLoss с температурой 0.01 и BAAI/bge-m3 в качестве guide model
  - результат: GISTEmbedLoss даёт более высокий recall@k
- [x] получить hard negatives с помощью обученной модели
- [x] дообучить модель на hard negatives
  - [x] сравнить MultipleNegativesRankingLoss и GISTEmbedLoss
    - [x] MultipleNegativesRankingLoss
    - [x] GISTEmbedLoss с температурой: 0.01, 0.05, 0.1
    - результат: обе функции потерь показывают тот же recall@k, но лучше MultipleNegativesRankingLoss по времени и памяти, так как не требует использования guide model
  - [ ] получение hard negatives
    - range
      - [ ] range_max 50
      - [ ] range_max 100
      - [ ] range_max 200
      - результат:
    - margin
      - [ ] 0.1
      - [ ] 0.0
      - [ ] default(check)
      - результат:
    - margin
      - [ ] 0.1
      - [ ] 0.0
      - [ ] default(check)
      - результат:
    - max_score
      - [ ] 0.8
      - [ ] 0.9
      - результат:
    - num_negatives
      - [ ] 1
      - [ ] 3
      - [ ] 5
      - результат:
- [x] (bug) секции не содержат информации о квесте; например, что это основной квест или квест на мастерство
  - [x] prepend section with quest info
- [ ] write 200 queries yourself, eval
- [x] (bug) 'arcanum', 'steamwords', 'arkanum', 'num' in queries
  - regexp did not work: too many variations
  - [x] remove prompt line '...You are a player of the RPG game "Arcanum'
- [x] (bug) vague queries are too vague
  - prompt engineering did not work
  - [x] switched to 14 b qwen: base model recall@5 0.9 => 0.96
  - [ ] why hard negatives do not improve recall@5?

- [x] (bug) duplicates of documents during inference: removed duplicates

- [ ] read hard few hard negatives: do they make sence?
- [ ] base model: why locc improves, recall not?

- [ ] train base model 3 more epochs

- [ ] lora?

- [ ] retrieval + bm25
