# arcanumsearch

семантический поиск по квеcтам игры Arcanum: Of Steamworks and Magick Obscura

датасет: https://huggingface.co/datasets/pameydorke/arcanum-quests-queries-synthetic

модель: https://huggingface.co/pameydorke/arcanum-quests-retriever-with-hard-negatives

## задачи

# скрапинг

- [ ] ~~скрапинг arcanum.fandom.com~~: бек отвечал 403; нужно было или более тщательно имитировать реальный запрос, или скрапить по апи; выбрал последнее
- [x] скрапинг arcanum.fandom.com/api.php

# #синтез данных

- [x] синтеза поисковых запросов с помощью 7b qwen
  - [x] (баг) qwen продолжает генерировать после нужного джейсона: stop_strings
  - [x] (баг) qwen генерирует запросы, которые реальный пользователь не составит, так как для них требуется знать финал и внутреннее устройство квест("how can I get 1700 experience?"): поправил промпты
  - [x] (баг) qwen генерирует больше k поисковых запросов: изменение промпта и переход на 14b не исправили; решил брать первые k из сгенерированных
  - [x] (баг) qwen генерирует запросы, основываясь на несущественной информации и заголовка секции(Notes, Walkthrough, Parn 1): убрал заголовок из промпта
  - [x] (баг) qwen включает в запросы слово Arcanum, что излишне: добавил требование в промпт

## обучение ретривера

- [x] обучить модель на основе BAAI/bge-m3 с помощью GISTEmbedLoss, MultipleNegativesRankingLoss; взять лучший лосс

TODO:

- context windows: If sections are sequential (Part 1 → Part 2), prepend summary of previous 1-2 sections or quest title to each row before encoding
- Avoid negatives from the same quest but different sections (these are often too easy or accidentally false negatives)
- Manually label 100-200 real player queries (or use GPT-4 to simulate "confused player" queries) rather than relying solely on synthetic query distribution

GISTEmbedLoss => MultipleNegativesRankingLoss: no OOM, but trained model has "test Cosine Recall@5" of 0.84, which is less then model_v1 "test Cosine Recall@5" of 0.87

TODO:

- kimi suggestions => story
  trained model as guide model
  batch size, grad accum: 2, 2 => 8, 2
  tempreture higher for hard negatives: 0.05 or 0.1
  MultipleNegativesRankingLoss: better for hard negatives?
  lr a but smaller: 2e-5
  better config: mine_hard_negatives(
  dataset=train_dataset,
  model=model,
  range_min=10,
  range_max=100,
  max_score=0.9,
  num_negatives=1,
  batch_size=16,
  use_faiss=True,
  )

ds issue: sections do not know about main purpose: https://arcanum.fandom.com/wiki/Find_the_Bow_of_Ecclesiastes is about becoming a bow master
TODO: prepend section with basic quest info like: "Bow mastery quest..."

https://arcanum.fandom.com/wiki/Find_Dudley_Crosston hard negative: two metions of bow master, but it's not bow master quest
