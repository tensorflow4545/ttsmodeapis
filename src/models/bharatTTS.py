import sys
import json
import torch
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
import soundfile as sf

# Determine the device (GPU or CPU)
device = "cuda:0" if torch.cuda.is_available() else "cpu"

# Load the model and tokenizers
print("Loading model and tokenizers...")
try:
    model = ParlerTTSForConditionalGeneration.from_pretrained("ai4bharat/indic-parler-tts").to(device)
    tokenizer = AutoTokenizer.from_pretrained("ai4bharat/indic-parler-tts")
    description_tokenizer = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
    print("Model and tokenizers loaded successfully.")
except Exception as e:
    print(f"Error loading model or tokenizers: {e}")
    sys.exit(1)

def main():
    try:
        # Read and parse input JSON data
        print("Reading input data...")
        input_data = json.loads(sys.stdin.read())
        print(f"Input data received: {input_data}")

        prompt = input_data.get("prompt")
        description = input_data.get("description", "A neutral tone voice with a clear speech quality.")

        if not prompt:
            print("Error: 'prompt' field is missing or empty.")
            sys.exit(1)

        print(f"Prompt: {prompt}")
        print(f"Description: {description}")

        # Tokenize description and prompt
        print("Tokenizing input data...")
        description_input_ids = description_tokenizer(description, return_tensors="pt").to(device)
        prompt_input_ids = tokenizer(prompt, return_tensors="pt").to(device)
        print("Tokenization successful.")

        # Generate audio
        print("Generating speech...")
        generation = model.generate(
            input_ids=description_input_ids.input_ids,
            attention_mask=description_input_ids.attention_mask,
            prompt_input_ids=prompt_input_ids.input_ids,
            prompt_attention_mask=prompt_input_ids.attention_mask,
        )
        print("Speech generation completed.")

        # Convert generated audio to numpy array
        audio_arr = generation.cpu().numpy().squeeze()
        print(f"Audio array shape: {audio_arr.shape}")

        # Write audio to file
        output_file = "indic_tts_out.wav"
        print(f"Saving audio to file: {output_file}")
        sf.write(output_file, audio_arr, model.config.sampling_rate)
        print(f"Audio file saved successfully: {output_file}")

    except Exception as e:
        print(f"Error during execution: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
