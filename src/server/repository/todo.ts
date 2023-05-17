import { HttpNotFoundError } from "@server/infra/errors";
import { Todo, TodoSchema } from "@server/schema/todo";
import { supabase } from "@server/infra/db/supabase";

interface ITodoRepositoryGetParams {
  page?: number;
  limit?: number;
}
interface ITodoRepositoryGetOutput {
  todos: Todo[];
  total: number;
  pages: number;
}

async function get({
  page,
  limit,
}: ITodoRepositoryGetParams = {}): Promise<ITodoRepositoryGetOutput> {
  const currentPage = page || 1;
  const currentLimit = limit || 3;
  const startIndex = (currentPage - 1) * currentLimit;
  const endIndex = currentPage * currentLimit;

  const { data, error, count } = await supabase
    .from("todos")
    .select("*", { count: "exact" })
    .order("date", { ascending: false })
    .range(startIndex, endIndex);

  if (error) throw new Error("Failed to fetch data");

  const parsedData = TodoSchema.array().safeParse(data);
  if (!parsedData.success) {
    throw parsedData.error;
  }

  const todos = parsedData.data;
  const total = count || todos.length;
  const totalPages = Math.ceil(total / currentLimit);

  return {
    todos,
    total,
    pages: totalPages,
  };
}

async function createByContent(content: string): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .insert([
      {
        content,
      },
    ])
    .select()
    .single();

  if (error) throw new Error("Failed to create todo");

  const parsedData = TodoSchema.parse(data);

  return parsedData;
}

async function getTodoByid(id: string): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error("Failed to create");

  const parsedData = TodoSchema.parse(data);

  return parsedData;
}

async function updateById(id: string) {
  const todo = await getTodoByid(id);

  const { data, error } = await supabase
    .from("todos")
    .update({
      done: !todo.done,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Failed to update");

  const parsedData = TodoSchema.safeParse(data);
  if (!parsedData.success) {
    throw parsedData.error;
  }

  return parsedData.data;
}

async function deleteById(id: string) {
  const { data, error } = await supabase.from("todos").delete().match({
    id,
  });

  if (error) throw new HttpNotFoundError(`Todo with id "${id}" not found`);
}

export const todoRepository = {
  get,
  createByContent,
  updateById,
  deleteById,
};
