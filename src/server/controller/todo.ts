import { todoRepository } from "@server/repository/todo";
import { z as schema } from "zod";
import { NextApiRequest, NextApiResponse } from "next";
import { HttpNotFoundError } from "@server/infra/errors";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query;
  const page = Number(query.page);
  const limit = Number(query.limit);

  if (!query.page && isNaN(page)) {
    res.status(400).json({
      error: {
        message: "`page` must be a number",
      },
    });
    return;
  }
  if (!query.limit && isNaN(limit)) {
    res.status(400).json({
      error: {
        message: "`limit` must be a number",
      },
    });
    return;
  }
  const output = todoRepository.get({ page, limit });
  res.status(200).json({
    total: output.total,
    todos: output.todos,
    pages: output.pages,
  });
}

const ToDoCreateBodySchema = schema.object({
  content: schema.string(),
});

async function create(req: NextApiRequest, res: NextApiResponse) {
  const body = ToDoCreateBodySchema.safeParse(req.body);

  if (!body.success) {
    res.status(400).json({
      error: {
        message: "You need to provide a content to create a ToDo",
        description: body.error.issues,
      },
    });
    return;
  }

  const createdToDo = await todoRepository.createByContent(body.data.content);

  res.status(201).json({
    todo: createdToDo,
  });
}

async function update(req: NextApiRequest, res: NextApiResponse) {
  const toDoId = req.query.id;

  if (!toDoId || typeof toDoId !== "string") {
    res.status(400).json({
      error: {
        message: "You must to provide a String Id!",
      },
    });
    return;
  }
  try {
    const updatedTodo = await todoRepository.updateById(toDoId);
    res.status(200).json({
      todo: updatedTodo,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({
        error: {
          message: error.message,
        },
      });
    }
  }
}

async function deleteById(req: NextApiRequest, res: NextApiResponse) {
  const querySchema = schema.object({
    id: schema.string().uuid().nonempty(),
  })
  const parsedQuery = querySchema.safeParse(req.query)
  if(!parsedQuery.success) {
    res.status(400).json({
      error: {
        message: "You must to provide a valid ID"
      },
    });
    return;
  }

  const toDoId = parsedQuery.data.id
  try {
    await todoRepository.deleteById(toDoId);
    res.status(204).end();
  } catch (error) {
    if (error instanceof HttpNotFoundError) {
      res.status(error.status).json({
        error: {
          message: error.message,
        },
      });
    }
    res.status(500).json({
      error: {
        message: `Internal server Error`,
      },
    });
  }
}

export const todoController = {
  get,
  create,
  update,
  deleteById,
};
