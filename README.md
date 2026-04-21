# arcanumsearch

семантический поиск по квеcтам игры Arcanum: Of Steamworks and Magick Obscura

датасет: https://huggingface.co/datasets/pameydorke/arcanum-quests-queries-synthetic

модель: https://huggingface.co/pameydorke/arcanum-quests-retriever-with-hard-negatives

## основная метрика

recall@k: лучше показать пользователю релевантный документ в результате поиска не на первом месте, чем не показать вообще

## задачи

#### скрапинг

- [ ] ~~скрапинг arcanum.fandom.com~~: бек отвечал 403; нужно было или более тщательно имитировать реальный запрос, или скрапить по апи; выбрал последнее
- [x] скрапинг arcanum.fandom.com/api.php

#### синтез данных

- [x] синтеза поисковых запросов с помощью 7b qwen
  - [x] (баг) qwen продолжает генерировать после нужного джейсона: stop_strings
  - [x] (баг) qwen генерирует запросы, которые реальный пользователь не составит, так как для них требуется знать финал и внутреннее устройство квест("how can I get 1700 experience?"): поправил промпты
  - [x] (баг) qwen генерирует больше k поисковых запросов: изменение промпта и переход на 14b не исправили; решил брать первые k из сгенерированных
  - [x] (баг) qwen генерирует запросы, основываясь на несущественной информации и заголовка секции(Notes, Walkthrough, Parn 1): убрал заголовок из промпта
  - [x] (баг) qwen включает в запросы слово Arcanum, что излишне: добавил требование в промпт

#### обучение ретривера

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
  - [x] получение hard negatives
    - range
      - [x] range_max 50
      - [x] range_max 100
      - [x] range_max 200
      - результат:
    - margin
      - [x] 0.1
      - [x] 0.0
      - [x] default(check)
      - результат:
    - margin
      - [x] 0.1
      - [x] 0.0
      - [x] default(check)
      - результат:
    - max_score
      - [x] 0.8
      - [x] 0.9
      - результат:
    - num_negatives
      - [x] 1
      - [x] 3
      - [x] 5
      - результат:
- [ ] (баг) секции не содержат информации и квесте; например, что это основной квест и квемт на мастерство
  - [ ] добавить инфорамцию о квест в начало каждой секции
- [ ] проверить на реальных данных(написать запросы самому)
