import sys
import outetts

def main(text, speaker_name="male_1", temperature=0.1, output_path="output.wav"):
    # Configure the model using HFModelConfig_v1
    model_config = outetts.HFModelConfig_v1(
        model_path="OuteAI/OuteTTS-0.2-500M",
        language="en"
    )

    # Initialize the interface
    interface = outetts.InterfaceHF(model_version="0.2", cfg=model_config)

    # Load the specified speaker
    try:
        speaker = interface.load_default_speaker(name=speaker_name)
    except Exception as e:
        print(f"Error loading speaker {speaker_name}: {e}", file=sys.stderr)
        sys.exit(1)

    # Generate speech
    try:
        output = interface.generate(
            text=text,
            temperature=float(temperature),
            repetition_penalty=1.1,
            max_length=4096,
            speaker=speaker
        )

        # Save the generated speech
        output.save(output_path)
        print(f"Audio saved to {output_path}")
    except Exception as e:
        print(f"Error generating speech: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    # Check for correct number of arguments
    if len(sys.argv) < 2:
        print("Usage: python OutetTTS.py '<text>' [speaker] [temperature] [output_path]")
        sys.exit(1)

    # Parse arguments with default values
    text = sys.argv[1]
    speaker_name = sys.argv[2] if len(sys.argv) > 2 else "male_1"
    temperature = float(sys.argv[3]) if len(sys.argv) > 3 else 0.1
    output_path = sys.argv[4] if len(sys.argv) > 4 else "output.wav"

    main(text, speaker_name, temperature, output_path)