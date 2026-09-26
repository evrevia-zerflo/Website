#!/bin/bash
echo "Starting overnight run for all categories..."

# List of all categories configured in categories.yaml
categories=(
  "clothing"
  "bags"
  "footwear"
  "jewelry"
  "hair"
  "watches"
  "lifestyle"
  "fashion-accessories"
  "beauty-accessories"
)

# Loop through each category and run the pipeline
for cat in "${categories[@]}"; do
    echo "========================================"
    echo "Running category: $cat"
    echo "========================================"
    
    # We set max-per-supplier to 60 as requested.
    python -m hunter.cli run --category "$cat" --max-per-supplier 60 --no-ai
    
    # Add a small delay between runs to let the system rest
    sleep 5
done

echo "========================================"
echo "All categories finished!"
echo "Check data/meesho_links.json for your results."
