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

#### inference

- [x] (bug) duplicates of documents: removed duplicates
- [ ] (bug): 228 enhanced_documents, not 229

#### evaluation

- [ ] write 200 queries yourself, eval(one query that wiki website handles, one that not)

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
- [ ] all arcanum.fandom.com, not just quests
  - [ ] if text small make it one document, else split by sections: https://arcanum.fandom.com/wiki/Quest_NPCs
  - [ ] skip some: https://arcanum.fandom.com/wiki/Quests_Sandbox, https://arcanum.fandom.com/wiki/Quests_Template
  - [ ] use fandom.wiki.search instead
    - https://arcanum.fandom.com/api.php?action=query&list=search&srsearch=dog&format=json
    - https://arcanum.fandom.com/api.php?action=query&meta=userinfo&uiprop=ratelimits
    - [ ] Retry-After headers

#### preprocessing

- [ ] check length; some texts too big: https://www.reddit.com/r/arcanum/comments/z3x6h8/arcanum_patches_mods_compilation_what_to_download/
- [ ] remove duplicates
- [ ] handle reddit kind == 'more' and other useless

#### synthetic data

- [ ] use modern gemma4 instead of qwen

#### eval

- [ ] AUP is mentioned everywhere; will simple request 'UAP' will show original terra-arcanum page?

#### ui

- [ ] add highlight to fandom wiki link 'https://en.wikipedia.org/wiki/Cat#:~:text=native%20felines'
- [ ] if doc is from fandom, show info that it's official patch
