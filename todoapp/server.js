import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ➕ POST /todos - Add a new todo
app.post("/todos", async (req, res) => {
  try {
    const { title } = req.body;
    const { error } = await supabase.from("todos").insert([{ title }]);
    if (error) throw error;
    res.status(201).json({ message: "Todo saved successfully!" });
  } catch (err) {
    console.error("Error saving todo:", err);
    res.status(500).json({ error: "Error saving todo" });
  }
});

// 📄 GET /todos - Fetch all todos
app.get("/todos", async (req, res) => {
  try {
    const { data, error } = await supabase.from("todos").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).json({ error: "Error fetching todos" });
  }
});

// ❌ DELETE /todos/:id - Delete a todo by ID
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) throw error;
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ error: "Error deleting todo" });
  }
});

// ✨ POST /summarize - Summarize all todos and send to Slack
app.post("/summarize", async (req, res) => {
  try {
    const { data: todos, error } = await supabase.from("todos").select("title");

    if (error) throw error;
    if (!todos || todos.length === 0) {
      return res.status(400).json({ error: "No todos to summarize" });
    }

    const todoText = todos.map((todo, i) => `${i + 1}. ${todo.title}`).join("\n");

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `Summarize the following todos:\n${todoText}` }]
            }
          ]
        })
      }
    );

    const geminiData = await geminiResponse.json();
    const summary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!summary) throw new Error("Failed to generate summary from Gemini");

    const slackRes = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `📝 *Todo Summary:*\n${summary}` })
    });

    if (!slackRes.ok) throw new Error("Failed to send summary to Slack");

    res.status(200).json({ message: "Summary sent to Slack", summary });

  } catch (err) {
    console.error("Error summarizing todos:", err);
    res.status(500).json({ error: "Error summarizing todos" });
  }
});

// 🚀 Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
