#!/bin/bash
set -e

INPUT="src/constants/colors.json"
OUTPUT="dist/styles/colors.scss"

# Ensure output dir exists
mkdir -p "$(dirname "$OUTPUT")"

# Start file
echo "// Auto-generated from $INPUT" > "$OUTPUT"
echo "" >> "$OUTPUT"

# Begin Sass map
echo "\$colors: (" >> "$OUTPUT"

# Convert JSON to SCSS map entries
# jq prints "key": value, handling quotes correctly
jq -r 'to_entries | .[] | "  \"" + .key + "\": " + .value + ","' "$INPUT" >> "$OUTPUT"

# End Sass map
echo ");" >> "$OUTPUT"

echo "Generated $OUTPUT"
