#!/bin/bash
cd ~/Documents/cerveau-declic-phase2-light
echo "Paste your GitHub Personal Access Token and press Enter:"
read -s TOKEN
git config credential.helper cache
git credential-cache exit
git push -u origin master:main --force-with-lease
