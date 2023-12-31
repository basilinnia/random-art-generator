import { useState } from "react";
import { generate } from "random-words";
export default function Home() {
  const [initialPrompt, setInitialPrompt] = useState(generate(10).toString().trim(","));
  const [promptValue, setPromptValue] = useState(initialPrompt);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [stylePrompt, setStylePrompt] = useState("");
  const [toolPrompt, setToolPrompt] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const {negative_prompt} = Object.fromEntries(formData.entries());

    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({prompt: promptValue +"in the style of "+ stylePrompt + "painted with using/in: " + toolPrompt, negative_prompt}),
    });

    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    const timer = setInterval(async () => {
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      setPrediction(prediction);
      if (prediction.status === "succeeded") {
        setPrediction(prediction);
        clearInterval(timer);
      }
    }, 1000);
  };
  return (
      <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-600 py-6 flex flex-col justify-center items-center">
      <div className="mb-4 text-white text-xl font-semibold">
        Initial Prompts
        <p className="bg-gray-200 rounded px-2 py-1 text-black text-center">{initialPrompt}</p>
      </div>
      <div className="w-2/3 bg-white shadow-md rounded-lg p-6 mx-20">
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="prompt">
              Prompt
            </label>
            <textarea
              name="prompt"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="negative_prompt">
              Negative Prompt
            </label>
            <textarea
              name="negative_prompt"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="style">
              Style Prompt
            </label>
            <textarea
              name="style"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              value={stylePrompt}
              onChange={(e) => setStylePrompt(e.target.value)}
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tool">
              Tool Prompt
            </label>
            <textarea
              name="tool"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              value={toolPrompt}
              onChange={(e) => setToolPrompt(e.target.value)}
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            GENERATE
          </button>
        </form>
      </div>
      {prediction && (
        <div className="bg-white shadow-md rounded-lg p-4 mt-4">
          {prediction.output && (
            <div className="grid grid-cols-2 gap-4">
              {prediction.output.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`output ${index + 1}`}
                  width={340}
                  height={340}
                  className="rounded-lg"
                />
              ))}
            </div>
          )}
          <p className="text-center text-gray-700 font-bold mt-4">Status: {prediction.status}</p>
        </div>
      )}
    </div>
  );
}