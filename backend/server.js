require("dotenv").config();
const express = require("express");

const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); // Enable cross-origin requests

// Dummy debate data

const debateData = {
  topic: "Is Social Media Doing More Harm Than Good?",
  participants: [
    {
      name: "Alice",
      position: "Against Social Media",
      speech:
        "Social media is a powerful tool, but unfortunately, its impact on society has been largely negative. One of the biggest issues is the rise in mental health problems. Studies have shown that excessive use of social media contributes to anxiety, depression, and low self-esteem, especially among teenagers. Platforms like Instagram and TikTok create unrealistic beauty standards, making young people feel inadequate. The constant need for validation through likes and comments fosters a culture of comparison, leading to social anxiety and cyberbullying. Moreover, social media has been a major source of misinformation, influencing public opinion in dangerous ways. Fake news spreads like wildfire, misleading people about critical issues like health, politics, and science. Additionally, the addictive nature of these platforms disrupts sleep, productivity, and real-life relationships. It is clear that social media is doing more harm than good.",
    },
    {
      name: "Bob",
      position: "Neutral Perspective",
      speech:
        "Social media is a double-edged sword—it has both positive and negative effects. On one hand, it connects people across the world, allows businesses to thrive, and spreads awareness about important social issues. However, the dark side of social media cannot be ignored. Mental health concerns, privacy violations, and the spread of misinformation are real problems. While some users benefit from the accessibility and learning opportunities provided by social platforms, others fall victim to cyberbullying, addiction, and propaganda. The solution is not to abandon social media altogether but to regulate it better. Governments and tech companies must implement stricter content moderation policies, improve digital literacy among users, and encourage healthier online habits. With the right balance, we can maximize its benefits while minimizing harm.",
    },
    {
      name: "Charlie",
      position: "In Favor of Social Media",
      speech:
        "Social media is one of the greatest technological advancements of our time. It has revolutionized communication, education, and business. Small businesses can now reach global audiences, marginalized communities have a platform to voice their concerns, and people can stay connected despite geographical barriers. Social movements like #MeToo and Black Lives Matter gained momentum through social media, leading to real-world change. Education has also been transformed, as students can access free courses, webinars, and expert discussions at any time. While there are concerns about mental health and misinformation, these are problems that can be mitigated with proper awareness and digital responsibility. Instead of blaming social media, we should focus on educating users on responsible usage. The benefits of social media far outweigh its drawbacks, and when used wisely, it can be a powerful tool for positive change.",
    },
  ],
};

async function analyzeDebate() {
  const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer fdc4c82a09604200aea492d9c548f268",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 512,
      messages: [
        {
          role: "system",
          content:
            "Analyze the debate and score each participant out of 100 based on the following criteria: \n\n" +
            "🔹 Speech Clarity & Coherence – How well the participant articulates ideas \n" +
            "🔹 Relevance to Topic – How closely the response aligns with the discussion\n" +
            "🔹 Engagement & Participation – Active involvement and responsiveness\n" +
            "🔹 Logical Strength – Quality of arguments and reasoning\n" +
            "🔹 Counterarguments & Rebuttals – Ability to challenge and defend points\n\n" +
            "Return a structured JSON response with each participant's name and scores for each parameter.",
        },
        {
          role: "user",
          content: JSON.stringify(debateData),
        },
      ],
    }),
  });

  const data = await response.json();
  console.log("AI Analysis:", JSON.stringify(data, null, 2));
}

analyzeDebate();

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
