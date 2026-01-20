import pandas as pd
from sqlalchemy import create_engine
import glob
import os

# 1. Setup Database Connection
DATABASE_URL = "sqlite:///./kyc.db"
engine = create_engine(DATABASE_URL)

def ingest_data():
    print("🚀 Starting Data Pipeline (v2 - Pincode Support)...")
    
    # 2. Find all CSV files
    path = "data/api_data_*.csv" 
    all_files = glob.glob(path)
    
    if not all_files:
        print("❌ Error: No CSV files found.")
        return

    print(f"📂 Found {len(all_files)} data shards. Processing...")

    li = []
    for filename in all_files:
        try:
            # Read Columns: B=State, C=District, D=Pincode, E=Updates
            df = pd.read_csv(filename, header=None, usecols=[1, 2, 3, 4], low_memory=False)
            df.columns = ['State', 'District', 'Pincode', 'Updates']
            
            # Clean Updates (Force to number)
            df['Updates'] = pd.to_numeric(df['Updates'], errors='coerce').fillna(0)
            
            # Clean Pincode (Force to string, remove decimals)
            df['Pincode'] = df['Pincode'].astype(str).str.replace(r'\.0$', '', regex=True)

            li.append(df)
            print(f"   -> Processed {os.path.basename(filename)}")
        except Exception as e:
            print(f"   ⚠️ Skipping {filename}: {e}")

    if not li: return
    full_df = pd.concat(li, axis=0, ignore_index=True)

    # 3. Calculate Risk Score per DISTRICT
    print("🧠 Calculating Regional Risk Scores...")
    district_stats = full_df.groupby(['District'])['Updates'].sum().reset_index()
    
    max_updates = district_stats['Updates'].max()
    district_stats['Risk_Score'] = (district_stats['Updates'] / max_updates) * 100
    district_stats['Risk_Score'] = district_stats['Risk_Score'].round(0)

    # 4. Merge Risk Score back to PINCODES (The Critical Fix)
    # This ensures we have | Pincode | District | Risk_Score |
    print("🔗 Mapping Pincodes to District Scores...")
    
    # Get unique Pincode-District pairs
    final_table = full_df[['Pincode', 'District']].drop_duplicates()
    
    # Join with the Risk Scores
    final_table = final_table.merge(district_stats[['District', 'Risk_Score']], on='District', how='left')
    
    final_table['Risk_Score'] = final_table['Risk_Score'].fillna(0)

    # 5. Save to Database
    print("💾 Saving table with PINCODES to SQLite...")
    final_table.to_sql('uidai_regional_risk', engine, if_exists='replace', index=False)

    print("✅ Success! Database now supports Pincode Search.")
    print(final_table.head())

if __name__ == "__main__":
    ingest_data()