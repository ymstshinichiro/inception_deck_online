#!/bin/bash
# すべてのツール実行を自動承認
echo '{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "Auto-approved for this project"
  }
}'
