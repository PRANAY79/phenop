
# ================== TRAIN MODELS FOR ALL TRAITS ==================
# Save as: train.py (inside server/ml_service)

import os
import gc
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

import xgboost as xgb


# ----------------- 1. FILE PATHS -----------------
GENO_FILE = "12k_ld_imputed.csv"          # genotype / SNP file
TRAIT_FILE = "quantitative_traits.csv"    # phenotype / trait file


# ----------------- 2. LOAD DATA -----------------
print("📂 Loading genotype and trait data...")
geno_df = pd.read_csv(GENO_FILE)
trait_df = pd.read_csv(TRAIT_FILE)

print("Genotype shape:", geno_df.shape)
print("Trait shape   :", trait_df.shape)


# ----------------- 3. DETECT MERGE KEY -----------------
common_cols = list(set(geno_df.columns) & set(trait_df.columns))

if "Unnamed: 0" in common_cols:
    MERGE_KEY = "Unnamed: 0"
elif "ID" in common_cols:
    MERGE_KEY = "ID"
else:
    if not common_cols:
        raise ValueError("❌ No common merge key found between genotype and trait files.")
    MERGE_KEY = common_cols[0]

print(f"🔑 Using '{MERGE_KEY}' as merge key.\n")


# ----------------- 4. MERGE FILES -----------------
merged_df = pd.merge(geno_df, trait_df, on=MERGE_KEY, how="inner")
print("Merged shape:", merged_df.shape)


# ----------------- 5. TRAITS TO TRAIN -----------------
TRAITS_TO_TRAIN = [
    "CUDI_REPRO", "CULT_REPRO", "CUNO_REPRO", "GRLT", "GRWD",
    "GRWT100", "HDG_80HEAD", "LIGLT", "LLT", "LWD", "PLT_POST", "SDHT"
]

missing_traits = [t for t in TRAITS_TO_TRAIN if t not in merged_df.columns]
if missing_traits:
    raise ValueError(f"❌ Missing traits in dataset: {missing_traits}")

NON_FEATURE_COLS = set(TRAITS_TO_TRAIN) | {MERGE_KEY}


# ----------------- 6. SNP FEATURE COLUMNS -----------------
snp_columns = [
    c for c in merged_df.columns
    if (c not in NON_FEATURE_COLS) and pd.api.types.is_numeric_dtype(merged_df[c])
]

if len(snp_columns) == 0:
    raise ValueError("❌ No numeric SNP columns detected!")

print(f"📌 Using {len(snp_columns)} SNP features.\n")


# ----------------- 7. OUTPUT DIRECTORY -----------------
BASE_OUTPUT_DIR = "multi_trait_models"
os.makedirs(BASE_OUTPUT_DIR, exist_ok=True)

os.environ["XGBOOST_FORCE_COLWISE"] = "1"   # memory optimization


# ----------------- 8. TRAINING FUNCTION -----------------
def train_one_trait(trait_name: str):
    print(f"\n================ TRAINING {trait_name} ================\n")

    df_trait = merged_df.dropna(subset=[trait_name]).copy()

    X = df_trait[snp_columns].astype("float32")
    y = df_trait[trait_name].astype("float32").values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = xgb.XGBRegressor(
        objective="reg:squarederror",
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.7,
        colsample_bytree=0.7,
        tree_method="hist",
        max_bin=128,
        grow_policy="lossguide",
        n_jobs=-1,
        eval_metric="rmse",
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = mse ** 0.5
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"📊 Metrics for {trait_name}:")
    print(f"RMSE = {rmse:.4f}")
    print(f"MAE  = {mae:.4f}")
    print(f"R²   = {r2:.4f}\n")

    # ---------------- SAVE MODEL ----------------
    trait_dir = os.path.join(BASE_OUTPUT_DIR, trait_name)
    os.makedirs(trait_dir, exist_ok=True)

    model.save_model(os.path.join(trait_dir, f"{trait_name}_xgb.json"))
    joblib.dump(snp_columns, os.path.join(trait_dir, "snp_columns.joblib"))

    print(f"✅ Saved model to: {trait_dir}")

    del df_trait, X, y, X_train, X_test, y_train, y_test, model
    gc.collect()


# ----------------- 9. TRAIN ALL TRAITS -----------------
for trait in TRAITS_TO_TRAIN:
    try:
        train_one_trait(trait)
    except Exception as e:
        print(f"❌ Error training {trait}: {e}")
        gc.collect()

print("\n🎉 All traits processed successfully!")
