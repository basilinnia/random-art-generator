import { useState } from "react";
import { generate } from "random-words";

export default function Home() {
  const initialPrompt = generate(10).toString().trim(",");
  const [promptValue, setPromptValue] = useState(initialPrompt);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [stylePrompt, setStylePrompt] = useState(""); // New state for "style" prompt
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { negative_prompt } = Object.fromEntries(formData.entries());

    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: promptValue, negative_prompt, style: stylePrompt }), // Include style prompt in the request
    });

    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }

    setPrediction(prediction);

    const timer = setInterval(async () => {
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      setPrediction(prediction);
      if (prediction.status === "succeeded") {
        clearInterval(timer);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-500 py-6 flex flex-col justify-center">
      <form className="flex flex-col w-full" onSubmit={onSubmit}>
        <p>{promptValue}</p> {/* Display the prompt value */}
        <div className="flex flex-col w-full items-center">
          <label htmlFor="prompt">Prompt</label>
          <textarea
            name="prompt"
            className="border-gray-900 p-2"
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
          ></textarea>
        </div>
        <div className="flex flex-col w-full items-center">
          <label htmlFor="negative_prompt">Negative Prompt</label>
          <textarea
            name="negative_prompt"
            className="border-gray-900 p-2"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
          ></textarea>
        </div>
        <div className="flex flex-col w-full items-center">
          <label htmlFor="style">Style Prompt</label>
          <textarea
            name="style"
            className="border-gray-900 p-2 text-blue-500" // Add a different color style to the textarea
            value={stylePrompt}
            onChange={(e) => setStylePrompt(e.target.value)} // Update the state when the textarea value changes
          ></textarea>
        </div>
        <button type="submit">GENERATE</button>
      </form>
      {prediction && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          {prediction.output && (
            <div className="grid grid-cols-2 gap-4">
              {prediction.output.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`output ${index + 1}`}
                  width={340}
                  height={340}
                  className="rounded"
                />
              ))}
            </div>
          )}
          <p className="text-center text-gray-700 font-bold">Status: {prediction.status}</p>
        </div>
      )}
    </div>
  );
}
