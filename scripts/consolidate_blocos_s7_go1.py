#!/usr/bin/env python3
"""
Consolidate and batch-write GO1 blocos from agent outputs into final JSON files.
Usage: python3 consolidate_blocos_s7_go1.py --agent-outputs <dir> --output-dir <dir>
"""

import json
import os
import sys
import argparse
from pathlib import Path
from datetime import datetime

def consolidate_agent_outputs(agent_outputs_dir):
    """
    Read all JSON outputs from agent tasks and consolidate into single dict.
    Agents output JSONL or JSON with 'blocos_gerados' array.
    """
    blocos_dict = {}

    for file in Path(agent_outputs_dir).glob("*.output"):
        print(f"Processing {file.name}...")
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
                # Try to parse as JSON (some agents output trailing newlines, etc)
                try:
                    data = json.loads(content)
                except json.JSONDecodeError:
                    # Try line-by-line JSONL parsing
                    for line in content.strip().split('\n'):
                        if line.strip():
                            try:
                                data = json.loads(line)
                                if 'blocos_gerados' in data:
                                    for bloco in data['blocos_gerados']:
                                        blocos_dict[bloco['id']] = bloco
                            except json.JSONDecodeError:
                                pass
                    continue

                if 'blocos_gerados' in data:
                    for bloco in data['blocos_gerados']:
                        blocos_dict[bloco['id']] = bloco

        except Exception as e:
            print(f"  ERROR reading {file.name}: {e}")

    return blocos_dict

def write_bloco_files(blocos_dict, output_dir, base_path="/c/Users/vegag/.claude/anima/med/dist/blocos/go1"):
    """
    Write each bloco to its individual JSON file.
    """
    written_count = 0
    failed_count = 0

    for bloco_id, bloco_data in blocos_dict.items():
        file_path = os.path.join(base_path, f"{bloco_id}.json")

        try:
            # Ensure valid JSON structure
            if 'id' not in bloco_data:
                bloco_data['id'] = bloco_id

            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(bloco_data, f, ensure_ascii=False, indent=2)

            written_count += 1
            if written_count % 10 == 0:
                print(f"  Written {written_count} blocos...")
        except Exception as e:
            print(f"  FAILED to write {bloco_id}: {e}")
            failed_count += 1

    return written_count, failed_count

def validate_blocos(blocos_dict):
    """
    Quick validation — check each bloco has required fields.
    """
    required_fields = ['id', 'titulo', 'etapas_anima', 'flashcards', 'metadata']
    issues = []

    for bloco_id, bloco_data in blocos_dict.items():
        missing = [f for f in required_fields if f not in bloco_data]
        if missing:
            issues.append(f"{bloco_id}: missing {missing}")

    return issues

def main():
    parser = argparse.ArgumentParser(description="Consolidate GO1 bloco agents outputs")
    parser.add_argument("--agent-outputs", required=True, help="Directory with agent .output files")
    parser.add_argument("--output-dir", default="/c/Users/vegag/.claude/anima/med/dist/blocos/go1",
                       help="Directory to write individual bloco JSON files")
    parser.add_argument("--validate-only", action="store_true", help="Validate without writing")

    args = parser.parse_args()

    print(f"Consolidating agent outputs from {args.agent_outputs}...")
    blocos_dict = consolidate_agent_outputs(args.agent_outputs)

    print(f"Total blocos consolidated: {len(blocos_dict)}")

    issues = validate_blocos(blocos_dict)
    if issues:
        print(f"VALIDATION ISSUES ({len(issues)}):")
        for issue in issues[:10]:  # Show first 10
            print(f"  {issue}")

    if not args.validate_only:
        print(f"Writing blocos to {args.output_dir}...")
        written, failed = write_bloco_files(blocos_dict, args.output_dir)
        print(f"WRITE RESULTS: {written} written, {failed} failed")

        if written > 0:
            print(f"SUCCESS: {written}/{len(blocos_dict)} blocos written")

    return 0 if len(blocos_dict) > 0 else 1

if __name__ == "__main__":
    sys.exit(main())
