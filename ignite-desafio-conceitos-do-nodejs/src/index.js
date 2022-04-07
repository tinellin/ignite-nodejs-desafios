const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  if (!username) return res.status(404).json({ error: "User undefined." });

  const userExists = users.find((user) => user.username === username);

  if (!userExists) res.status(404).json({ error: "User not found." });

  req.user = userExists;

  return next();
}

function checksExistsUserTodo(req, res, next) {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) return res.status(404).json({ error: "Todo not found." });

  req.todo = todo;

  return next();
}

app.post("/users", (req, res) => {
  const { name, username } = req.body;

  const alreadyExistsUser = users.some((user) => user.username === username);

  if (alreadyExistsUser)
    return res.status(400).json({ error: "User already exists." });

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return res.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { user } = req;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return res.status(201).json(todo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsUserTodo,
  (req, res) => {
    const { title, deadline } = req.body;
    const { todo } = req;

    todo.title = title;
    todo.deadline = deadline;

    return res.json(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksExistsUserTodo,
  (req, res) => {
    const { todo } = req;

    todo.done = true;

    return res.json(todo);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsUserTodo,
  (req, res) => {
    const { user, todo } = req;

    user.todos.splice(todo, 1);

    res.status(204).send();
  }
);

module.exports = app;
