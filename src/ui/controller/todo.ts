import { todoRepository } from "@ui/repository/todo";
import { z as schema } from "zod";
import { Todo } from "@ui/schema/todo";

interface ToDoControllerGetParams {
  page: number;
}

async function get({ page }: ToDoControllerGetParams) {
  return todoRepository.get({ page: page || 1, limit: 5 });
}

interface ToDoControllerCreateParams {
  content?: string;
  onError: () => void;
  onSuccess: (todo: Todo) => void;
}
function create({ content, onError, onSuccess }: ToDoControllerCreateParams) {
  const parsedParams = schema.string().nonempty().safeParse(content);

  if (!parsedParams.success) {
    onError();
    return;
  }

  todoRepository
    .createByContent(parsedParams.data)
    .then((newTodo) => {
      onSuccess(newTodo);
    })
    .catch(() => onError);
}

interface TodoControllerToggleDoneParams {
  id: string;
  updateToDoOnScreen: () => void;
  onError: () => void;
}
function toggleDone({
  id,
  updateToDoOnScreen,
  onError,
}: TodoControllerToggleDoneParams) {

  todoRepository
    .toggleDone(id)
    .then(() => {
      updateToDoOnScreen();
    })
    .catch(() => {
      onError();
    });
}

function fuilterToDosByContent<Todo>(
  search: string,
  todos: Array<Todo & { content: string }>
): Todo[] {
  const homeTodos = todos.filter((todo) => {
    const todoContent = todo.content.toLowerCase();
    return todoContent.includes(search.toLowerCase());
  });
  return homeTodos;
}

async function DeleteById(id: string){
  await todoRepository.DeleteById(id)
}

export const todoController = {
  get,
  fuilterToDosByContent,
  create,
  toggleDone,
  DeleteById,
};
