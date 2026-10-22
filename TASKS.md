## fandom wiki

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
- [ ] us different(bigger) guide model; using different instance of the same model is questionable

#### inference

- [x] (bug) duplicates of documents: removed duplicates
- [ ] (bug): 228 enhanced_documents, not 229

#### product idea rework

in it's current state model app does nothing that arcanum.fandom.com search can't do; apparently their fandom search is good enough to handle typos and vague requests

if I can't do simple search better then fandom then I should offer something more: cross-community search that includes stadart search for quests, stats, items, characters and also includes patches, modes, bugs from reddit, terra-arcanum.com, arcanumclub.org, https://rpgcodex.net/forums/?__cf_chl_rt_tk=QlL3sVaG9BukgoFl8BcOJnYtHDTejPkeyG25S5mBQ80-1781250793-1.0.1.1-42iPJ8UeeX4wg5Hqx.3qCwNiT9Xek4ROgANXC3LjmHc, https://gamefaqs.gamespot.com/pc/914155-arcanum-of-steamworks-and-magick-obscura/faqs/63974?print=1, https://www.pcgamingwiki.com/wiki/Arcanum:_Of_Steamworks_&_Magick_Obscura, https://www.nexusmods.com/arcanumofsteamworksandmagickobscura/mods/4

## cross-community

#### scraping

- [x] reddit
  - [x] add srach parameter to yandex cloud function
    - [x] https://functions.yandexcloud.net/d4e4d9s8rbi7flr2iei5?subreddit=arcanum&query=bug
  - [x] r/arcanum with query 'bug' and should include word 'bug'
  - [x] r/arcanum with query 'patch' and should include word 'patch' | 'UAP'
  - [x] r/arcanum with query 'mode' and should include word 'mode'
    - [x] skipped: 'mode' is often used in different context like 'easy mode', 'turne-based mode'
  - [x] fix 429 in reddit data
  - [x] scrap one page per request to git yandex cloud limits
  - [x] filter by upvotes? not need, default sorting by best if fine
  - [x] pinned
  - [x] manually saved to bookmarks
  - [x] filter by u/SCARaw? no need - post by user are already in scraped data
- [ ] terra-arcanum
  - [ ] define usefull docs; at least off and unoff patches; maybe top/recent bugs, tricks?
  - [ ] official patch
  - [ ] unofficial patch
  - [ ] level Cap Remover
  - [ ] high resolution patch
  - [ ] http://terra-arcanum.com/phpBB/viewtopic.php?t=16864
- [ ] arcanumclub.org
  - [ ] ru patch
- [ ] rpgcodex.net
  - [ ] http://www.rpgcodex.net/forums/index.php?threads/guide-to-arcanum-schematics-
        complete.54412/
- [ ] gamefaqs.gamespot.com
  - [ ] extensive weapon database
- [ ] pcgamingwiki.com
- [x] nexusmods.com
  - [x] https://www.nexusmods.com/arcanumofsteamworksandmagickobscura/mods/4 and other popular mods
- [x] ~~use fandom.wiki search instead of training a model on their documents?~~: only 1 request per minute
- [x] all arcanum.fandom.com, not just quests
  - [x] if text small make it one document, else split by sections: https://arcanum.fandom.com/wiki/Quest_NPCs
    - [x] if split prepend with quest name
  - [x] add skip aggregator pages logic: https://arcanum.fandom.com/wiki/Quests_Sandbox, https://arcanum.fandom.com/wiki/Quests_Template
  - [x] define full list of aggregator pages
  - [x] skip redirects: no need, wiil be fixed by deduplication
  - [x] skip stubs "This article is a stub. You can help Arcanum: Of Steamworks and Magick Obscura Wiki by expanding it"
    - [x] fix short_description is just full text for https://arcanum.fandom.com/wiki/Axes
  - [x] skip "in Game Files"
  - [x] skip Sandboxes
  - [x] run enhance notebook after
  - [x] handle items: https://arcanum.fandom.com/wiki/Axes
  - [x] dot lost after section in full TEXT
  - [ ] (low priority) scrap tables: https://arcanum.fandom.com/wiki/Ancient_Gods

#### preprocessing

- [x] arcanum-wiki
- [x] check length; handle too big: https://www.reddit.com/r/arcanum/comments/z3x6h8/arcanum_patches_mods_compilation_what_to_download/
- [x] remove duplicates
- [x] reddit
  - [x] handle reddit kind == 'more' and other useless
  - [x] format text + comments

#### synthetic data

- [x] stress in prompt that queries should not contain hidden info like exp, notes, part 1, etc
- [x] remove vague or regenerate without: qwen3-6-35b-a3b behind agent won't need it
- [x] genenrate dataset using qwen3-6-35b-a3b since this is the llm taht will generate queries in prodcution
  - [x] use vllm
  - [x] split 0.8 0.1 0.1 without shared documents, shuffle
- [x] add 10% reasonably vague queries and missplellings only in arcanum specific names, since llm under agent will fix general: arcanumchat-cross-platform-with-vague-queries-qwen-36-a3b-fp8
  - [x] add 10% seems to low, do 50%

#### train

- [x] retriever trainer: used same pipeline as for quests retriever: recall@5 0.77 -> 0.82
  - [x] 4 hard negs per query, margin 0.02, epochs 2, all-MiniLM-L6-v2 guide: recall@5 0.764 -> 0.787
  - [x] 4 hard negs per query, epochs 2, sampling_strategy "top", all-MiniLM-L6-v2 guide: recall@5 0.764 -> 0.810
  - [x] 4 hard negs per query, epochs 2, sampling_strategy "top", all-MiniLM-L6-v2 guide, no early stopping: recall@5 0.764 -> 0.813
- [x] reranker
  - [x] eval before train: {'val-hard-negatives_map': 0.8845814977973568, 'val-hard-negatives_mrr@10': 0.8845814977973568, 'val-hard-negatives_ndcg@10': 0.9141341657696732}
  - [x] train
    - [x] 2 hard neg per query: ndcg@10 plateaus at 0.95, val loss at 0.33 after 50 steps
    - [x] 4 hard negs per query, margin 0.02, epochs 2: ndcg@10 0.933 -> 0.955; 95% CI [+0.0141, +0.0425] on synth eval ds(questionable because same ds was used for early stopping, so need CI on hand-labeled ds)
    - [x] reeval initial with new hard neg params: 0.933
- [x] train retriever on "arcanumchat-cross-platform-qwen-36-a3b-fp8"
  - initial: recall@5 0.966490; ndcg@10 0.929574
- [x] 10% vague: train on arcanumchat-cross-platform-with-vague-queries-qwen-36-a3b-fp8
  - intial recall@10 0.992958; ndcg@10 0.929923
- [x] 60% vague: train on arcanumchat-cross-platform-with-vague-queries-qwen-36-a3b-fp8
  - intial recall@10 0.961887; ndcg@10 0.868659
- [x] 80% vague: train on arcanumchat-cross-platform-with-vague-queries-qwen-36-a3b-fp8
  - intial recall@10 0.979094; ndcg@10 0.890320

#### eval

- [x] UAP is mentioned everywhere; will simple request 'UAP' will show original page?
  - no, but a lot of relevant docs from reddit
- [x] write 200 queries yourself, eval
  - [x] (bug) recall@5 0.83 -> 0.815; ndcg@10 0.753 -> 0.737
    - gap between synthetic train data and hand labeled test data?
    - [x] run separetly on specific: recall@5 95% CI [0.0000, 0.0521]; ndcg@10 95% CI [-0.0386, 0.0309]
    - [x] paired bootstrap, confidence intervals: recall@5 95% CI = [-0.0455, 0.0152]; ndcg@10 95% CI = [-0.0445, 0.0146]; so no significant result
    - [ ] check synth data quality
    - [ ] check train setup
    - [x] check check if both models near ceiling
    - [ ] hold out synth validation split, of size 2000; eval base vs fine-tuned on that split
    - [x] check 6 queries that got worse on recall: all vague
    - [x] remvoe bad examples from test ds
  - [ ] paired bootstrap + CI on hand-labeled ds for retriever + reranker

#### frontend

- [x] favicon
- [x] fetch logic
- [x] ui
- [ ] add highlight to fandom wiki link 'https://en.wikipedia.org/wiki/Cat#:~:text=native%20felines'
- [ ] if doc is from fandom, show info that it's official patch
- [x] fix ccs center main container
- [x] fix css footer
- [x] check fetch in mutation
- [x] fix fancy text
- [ ] predownload font
- [x] fix reddit format title
- [x] deploy to gh pages
- [x] add 'Retrying' when retrying
- [ ] online metrics
  - [ ] CTR(click-through rate)
  - [ ] zero-result rate
  - [ ] user satisfaction

#### backend: postgres database + pgvector; cloud function + hf zero gpu deploy

- [x] store document embs: https://supabase.com/dashboard/project/mfphsrdubggjqxvyuzil
  - [x] upload manually as csv
- [ ] supabase auth
- [x] edge function: https://supabase.com/docs/guides/functions/quickstart
- [x] run locally
- [x] [bug] no schema for postgres function
- [x] test hfInference with vpn that allows access to huggingface
- [x] deploy connection to bd
- [x] deploy feature extraction to hf spaces
- [x] knn postges function
- [x] add 'title', 'content_raw' to data table
- [x] fix "Error: No GPU was available after 60s"
- [x] meaningful match_threshold: there's no 'Carl' in documents, but you still get 5 result with similarity 0.22-0.26
- [ ] [bug] duplicate https://arcanum.fandom.com/wiki/Character_background; try query 'wizard'

#### chat

- [x] RAG

#### other

- [ ] check if I can legally store reddit data with authors
- [x] make reddit post in r/arcanum
