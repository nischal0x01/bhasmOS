#!/bin/bash

TOTAL_COMMITS=20
DAYS=6

FILES=($(git status --porcelain | awk '{print $2}'))
FILE_COUNT=${#FILES[@]}

FILES_PER_COMMIT=$(( (FILE_COUNT + TOTAL_COMMITS - 1) / TOTAL_COMMITS ))

commit_index=0
file_index=0

for ((day=0; day<DAYS; day++)); do
  COMMITS_TODAY=$((TOTAL_COMMITS / DAYS))
  [ $day -lt $((TOTAL_COMMITS % DAYS)) ] && COMMITS_TODAY=$((COMMITS_TODAY + 1))

  for ((c=0; c<COMMITS_TODAY; c++)); do
    [ $commit_index -ge $TOTAL_COMMITS ] && break

    # fake time spacing (no date -d)
    HOUR=$((10 + c))
    COMMIT_DATE="2025-01-0$((day+1))T${HOUR}:00:00"

    for ((f=0; f<FILES_PER_COMMIT && file_index<FILE_COUNT; f++)); do
      git add "${FILES[$file_index]}"
      file_index=$((file_index + 1))
    done

    GIT_AUTHOR_DATE="$COMMIT_DATE" GIT_COMMITTER_DATE="$COMMIT_DATE" \
    git commit -m "Progress update ($((commit_index + 1))/20)"

    commit_index=$((commit_index + 1))
  done
done

