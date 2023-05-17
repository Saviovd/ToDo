import { read, create, update, deleteById as deleteByDB } from "@db-crud-todo";
import { HttpNotFoundError } from "@server/infra/errors";

interface ITodoRepositoryGetParams {
  page?: number;
  limit?: number;
}
interface ITodoRepositoryGetOutputs {
  todos: Todo[];
  total: number;
  pages: number;
}

interface Todo {
  id: string;
  content: string;
  date: string;
  done: boolean;
}

function get({
  page,
  limit,
}: ITodoRepositoryGetParams = {}): ITodoRepositoryGetOutputs {
  const currentPage = page || 1;
  const currentLimit = limit || 3;

  const ALL_TODOS = read().reverse();

  const startIndex = (currentPage - 1) * currentLimit;
  const endIndex = currentPage * currentLimit;
  const paginetedTodos = ALL_TODOS.slice(startIndex, endIndex);
  const totalPages = Math.ceil(ALL_TODOS.length / currentLimit);

  return {
    todos: paginetedTodos,
    total: ALL_TODOS.length,
    pages: totalPages,
  };
}

async function createByContent(content: string): Promise<Todo> {
  const newToDo = create(content);
  return newToDo;
}

async function updateById(id: string): Promise<Todo> {
  const ALL_TODOS = read();

  const isIdExisting = ALL_TODOS.find((todo) => todo.id === id);

  if (!isIdExisting) {
    throw new Error(`The ID: ${id} not Exists :(`);
  }

  const updatedToDo = update(isIdExisting.id, {
    done: !isIdExisting.done,
  });

  return updatedToDo;
}

async function deleteById(id: string) {
  const ALL_TODOS = read();

  const isIdExisting = ALL_TODOS.find((todo) => todo.id === id);

  if (!isIdExisting) {
    throw new HttpNotFoundError(`The ID: ${id} is not Found :(`);
  }

  deleteByDB(id);

  return;
}

export const todoRepository = {
  get,
  createByContent,
  updateById,
  deleteById,
};
