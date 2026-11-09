"""
Upload quantized ONNX model weights to Hugging Face Hub:
gradient-queen/whisper-tiny-indian-digits-final/onnx

Prerequisites:
  pip install huggingface_hub
  huggingface-cli login
  (Or set HF_TOKEN environment variable)
"""
import os
import sys
from pathlib import Path
from huggingface_hub import HfApi

REPO_ID = "gradient-queen/whisper-tiny-indian-digits-final"
SOURCE_DIR = Path("exported_model/whisper_onnx_q8")

def upload():
    if not SOURCE_DIR.exists():
        print(f"Error: {SOURCE_DIR} not found. Please run scripts/export_whisper_onnx.py first.")
        sys.exit(1)
        
    token = os.environ.get("HF_TOKEN") or None
    api = HfApi(token=token)
    
    print(f"Uploading ONNX weights from {SOURCE_DIR} to {REPO_ID} (folder: onnx/)...")
    try:
        api.upload_folder(
            folder_path=str(SOURCE_DIR),
            repo_id=REPO_ID,
            repo_type="model",
            path_in_repo="onnx",
            commit_message="Add INT8 quantized ONNX weights for Transformers.js / ONNX Runtime Web"
        )
        print("\n✅ Successfully uploaded ONNX model weights to Hugging Face Hub!")
        print(f"URL: https://huggingface.co/{REPO_ID}/tree/main/onnx")
    except Exception as e:
        print(f"\n❌ Upload failed: {e}")
        print("\nTo upload, make sure you are logged in:")
        print("  huggingface-cli login")
        print("or set HF_TOKEN: $env:HF_TOKEN=\"hf_your_write_token\"")

if __name__ == "__main__":
    upload()
