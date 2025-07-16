import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Todocars from "./components/todocars";
import Loader from "./components/loader";

const backendUrl = "http://localhost:5000"; // Change if hosted

function App() {
  const taskInput = useRef(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [message, setMessage] = useState("");

  const fetchTodos = async () => {
    try {
      const res = await axios.get(`${backendUrl}/todos`);
      setTodos(res.data);
    } catch (err) {
      console.error("Error fetching todos", err);
    }
  };

  const handleSubmit = async () => {
    const title = taskInput.current.value;
    if (!title) return;

    setLoading(true);
    try {
      await axios.post(`${backendUrl}/todos`, { title });
      taskInput.current.value = "";
      fetchTodos();
    } catch (err) {
      console.error("Error adding todo", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendUrl}/todos/${id}`);
      fetchTodos();
    } catch (err) {
      console.error("Error deleting todo", err);
    }
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    setMessage("");

    try {
      const res = await axios.post(`${backendUrl}/summarize`);
      setMessage(res.data.message);
    } catch (err) {
      console.error("Error summarizing todos", err);
      setMessage("Failed to send summary to Slack.");
    } finally {
      setSummarizing(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div>
      <div className="w-[480px] mx-auto mt-12">
        <h1 className="text-2xl font-bold">
          Manage your Task <span className="text-neutral-800">@Vaibhav</span>
        </h1>
        <p className="text-sm text-gray-600 mb-2">
          Create tasks, get summaries powered by Gemini AI, and post them to Slack 🚀
        </p>

        <input
          ref={taskInput}
          className="mt-2 border rounded-xl p-3 w-full focus:outline-none"
          type="text"
          placeholder="Add task i.e. Learn Gemini API"
        />

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleSubmit}
            className="py-2 px-3 bg-violet-300 text-violet-700 rounded-2xl"
          >
            {!loading ? "Create Task" : <Loader />}
          </button>

          <button
            onClick={handleSummarize}
            className="py-2 px-3 bg-green-200 text-green-700 rounded-2xl"
            disabled={summarizing}
          >
            {summarizing ? "Summarizing..." : "Summarize & Slack"}
          </button>
        </div>

        {message && (
          <div className="mt-3 p-2 bg-yellow-100 text-yellow-700 rounded-xl text-sm">
            {message}
          </div>
        )}

        <div className="mt-10">
          {todos.map((todo) => (
            <Todocars
              handleDelete={handleDelete}
              id={todo._id}
              title={todo.title}
              key={todo._id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
