#!/usr/bin/env bash
set -o errexit

# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Build the React frontend into frontend/dist
cd frontend
npm install
npm run build
cd ..

# 3. Ensure database and models are primed
python src/init_db.py
python src/ml_models.py
