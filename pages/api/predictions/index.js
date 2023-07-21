export default async function handler(req, res) {
    const {prompt, negative_prompt } = req.body;
    const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
        input: { num_outputs: 4,prompt, negative_prompt},
    }),
});

if (response.status !== 201) {
    let error = await response.json();
    res.statusCode = 500;
    res.end(JSON.stringify({detail: error.detail}));
    return;
}
    const prediction = await response.json();
    res.statusCode = 201;
    res.end(JSON.stringify(prediction));
}
