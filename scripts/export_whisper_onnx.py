"""
Export and quantize gradient-queen/whisper-tiny-indian-digits-final to ONNX for in-browser Transformers.js execution.
"""
import os
import shutil
from pathlib import Path
from optimum.onnxruntime import ORTModelForSpeechSeq2Seq, ORTQuantizer
from optimum.onnxruntime.configuration import AutoQuantizationConfig
from transformers import AutoProcessor, AutoTokenizer

MODEL_ID = "gradient-queen/whisper-tiny-indian-digits-final"
EXPORT_DIR = Path("exported_model/whisper_onnx")
QUANT_DIR = Path("exported_model/whisper_onnx_q8")

def main():
    print(f"=== Step 1: Exporting {MODEL_ID} to ONNX ===")
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Export using Optimum
    model = ORTModelForSpeechSeq2Seq.from_pretrained(MODEL_ID, export=True)
    model.save_pretrained(EXPORT_DIR)
    
    # Save processor and tokenizer configs
    processor = AutoProcessor.from_pretrained(MODEL_ID)
    processor.save_pretrained(EXPORT_DIR)
    
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    tokenizer.save_pretrained(EXPORT_DIR)
    
    print(f"Exported ONNX files in {EXPORT_DIR}:")
    for f in EXPORT_DIR.iterdir():
        print(f" - {f.name} ({f.stat().st_size / (1024*1024):.2f} MB)")

    print("\n=== Step 2: Applying INT8 Dynamic Quantization ===")
    QUANT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Copy json/config files to quant directory
    for f in EXPORT_DIR.glob("*.json"):
        shutil.copy2(f, QUANT_DIR / f.name)
    for f in EXPORT_DIR.glob("*.txt"):
        shutil.copy2(f, QUANT_DIR / f.name)
        
    from onnxruntime.quantization import quantize_dynamic, QuantType
    
    onnx_files = list(EXPORT_DIR.glob("*.onnx"))
    for onnx_path in onnx_files:
        quant_path = QUANT_DIR / onnx_path.name.replace(".onnx", "_quantized.onnx")
        q8_path = QUANT_DIR / onnx_path.name.replace(".onnx", "_q8.onnx")
        print(f"Quantizing {onnx_path.name} -> {quant_path.name}...")
        quantize_dynamic(
            model_input=str(onnx_path),
            model_output=str(quant_path),
            weight_type=QuantType.QUInt8
        )
        # Duplicate as _q8.onnx for transformers.js naming conventions
        shutil.copy2(quant_path, q8_path)
        shutil.copy2(quant_path, QUANT_DIR / onnx_path.name) # standard onnx name fallback
        print(f"  Created: {quant_path.name} ({quant_path.stat().st_size / (1024*1024):.2f} MB)")

    print("\n=== Export & Quantization Complete! ===")
    print(f"Final files in {QUANT_DIR}:")
    for f in QUANT_DIR.iterdir():
        print(f" - {f.name} ({f.stat().st_size / (1024*1024):.2f} MB)")

if __name__ == "__main__":
    main()
