import React, { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "react-toastify"; // Import toast notifications
import { isWebOrIPhone } from "./utils";

interface SpeechToTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  micPosition?: "left" | "right"; // Configurable mic position
  micColor?: string; // Configurable mic color
}

const SpeechToTextInput: React.FC<SpeechToTextInputProps> = ({
  value,
  onChange,
  placeholder = "What was this for?",
  required = false,
  micPosition = "right", // Default mic position
  micColor = "text-blue-600 hover:text-blue-700", // Default mic color
}) => {
  const [isListening, setIsListening] = useState(false);

  const startSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Speech recognition is not supported in this browser."); // Replace alert with toast
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Speech recognition started. Speak now!"); // Notify user when speech recognition starts
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      onChange(`${value} ${transcript}`.trim());
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      toast.error("An error occurred during speech recognition.");
    };

    recognition.onend = () => {
      setIsListening(false);
      toast.info("Speech recognition stopped.");
    };

    recognition.start();
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        placeholder={placeholder}
        required={required}
      />
      <button
        type="button"
        style={{ display: isWebOrIPhone() ? "none" : "block" }}
        onClick={startSpeechRecognition}
        className={`absolute top-2 ${
          micPosition === "right" ? "right-2" : "left-2"
        } ${micColor}`}
        title="Speak to add description"
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
    </div>
  );
};

export default SpeechToTextInput;
