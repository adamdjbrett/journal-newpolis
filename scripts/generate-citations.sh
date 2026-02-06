#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ARCHIVES_DIR="$ROOT_DIR/content/archives"
OUT_DIR="$ROOT_DIR/public/citations"
mkdir -p "$OUT_DIR"

# Function to emit RIS from front matter extracted via awk/sed
emit_ris() {
  local file="$1"
  local base
  base="$(basename "${file}" .md)"
  # Extract YAML front matter between --- markers
  local yaml
  yaml="$(awk 'BEGIN{found=0} /^---/{if(found==0){found=1;next}else{exit}} found==1{print}' "$file")"
  # Get fields using grep/sed (simple; assumes single-line values except title which may be multiline pipe style)
  local id title description year authors volume issue season pdf
  id="$(printf '%s\n' "$yaml" | sed -n 's/^id:[[:space:]]*//p')"
  year="$(printf '%s\n' "$yaml" | sed -n 's/^year:[[:space:]]*//p')"
  volume="$(printf '%s\n' "$yaml" | sed -n 's/^volume:[[:space:]]*//p')"
  issue="$(printf '%s\n' "$yaml" | sed -n 's/^issue:[[:space:]]*//p')"
  season="$(printf '%s\n' "$yaml" | sed -n 's/^season:[[:space:]]*//p')"
  authors="$(printf '%s\n' "$yaml" | sed -n 's/^authors:[[:space:]]*//p')"
  pdf="$(printf '%s\n' "$yaml" | sed -n 's/^pdf:[[:space:]]*//p')"
  # Title pipe style spans next indented lines until blank
  title="$(printf '%s\n' "$yaml" | awk '/^title:/{flag=1;next} /^description:/{flag=0} flag{print}' | sed 's/^\s\+//')"
  # Collapse newlines/extra spaces in title
  title="$(printf '%s' "$title" | tr '\n' ' ' | sed 's/  */ /g; s/^ *//; s/ *$//')"
  description="$(printf '%s\n' "$yaml" | sed -n 's/^description:[[:space:]]*"\(.*\)"/\1/p')"

  # Map author key(s) to names by reading authors collection file (simple lookup)
  local author_names=""
  if [[ -n "$authors" ]]; then
    IFS=',' read -r -a author_keys <<<"$authors"
    for key in "${author_keys[@]}"; do
      key_trimmed="$(echo "$key" | xargs)"
      author_file="$ROOT_DIR/content/authors/${key_trimmed}.md"
      if [[ -f "$author_file" ]]; then
        name_line="$(grep '^name:' "$author_file" | sed 's/^name:[[:space:]]*//' | sed 's/^ *//; s/ *$//')"
  author_names+="$name_line"$'\n'
      fi
    done
  fi

  # Generate RIS
  {
    echo "TY  - JOUR"
    [[ -n "$title" ]] && echo "TI  - $title"
    if [[ -n "$author_names" ]]; then
      while IFS= read -r n; do 
        n_trimmed="$(printf '%s' "$n" | tr -d '\r' | sed 's/^ *//; s/ *$//')"
        [[ -n "$n_trimmed" ]] && echo "AU  - $n_trimmed"
      done <<<"$author_names"
    fi
    [[ -n "$description" ]] && echo "AB  - $description"
    [[ -n "$year" ]] && echo "PY  - $year"
    [[ -n "$volume" ]] && echo "VL  - $volume"
    [[ -n "$issue" ]] && echo "IS  - $issue"
    [[ -n "$season" ]] && echo "N1  - $season"
    [[ -n "$pdf" ]] && echo "UR  - $pdf"
    [[ -n "$id" ]] && echo "ID  - $id"
    echo "ER  -"
  } > "$OUT_DIR/${base}.ris"

  # Generate minimal CSL JSON (single-item array)
  {
    echo "["
    echo "  {"
    echo "    \"id\": \"$id\","
    echo "    \"type\": \"article-journal\","    
    [[ -n "$title" ]] && echo "    \"title\": \"${title//\"/\\\"}\"," 
    if [[ -n "$author_names" ]]; then
      echo "    \"author\": ["
      i=0
      while IFS= read -r n; do
        n_trimmed="$(printf '%s' "$n" | tr -d '\r' | sed 's/^ *//; s/ *$//')"
        [[ -z "$n_trimmed" ]] && continue
        ((i>0)) && echo ","
        echo -n "      { \"literal\": \"${n_trimmed//\"/\\\"}\" }"
        ((i++))
      done <<<"$author_names"
      echo "    ],"
    fi
    [[ -n "$year" ]] && echo "    \"issued\": { \"raw\": \"$year\" },"
    [[ -n "$volume" ]] && echo "    \"volume\": \"$volume\","
    [[ -n "$issue" ]] && echo "    \"issue\": \"$issue\","
    [[ -n "$pdf" ]] && echo "    \"URL\": \"$pdf\""
    echo "  }"
    echo "]"
  } > "$OUT_DIR/${base}.csl.json"
}

# Loop files using find for macOS compatibility (no globstar)
while IFS= read -r -d '' file; do
  base="$(basename "$file")"
  [[ "$base" == "index.md" ]] && continue
  emit_ris "$file"
  echo "Generated citation for $file"
done < <(find "$ARCHIVES_DIR" -type f -name '*.md' -print0)

echo "All citation files written to $OUT_DIR"