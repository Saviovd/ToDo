import React from "react";
import { GlobalStyles } from "@ui/theme/GlobalStyles";
import { todoController } from "@ui/controller/todo";
const bg = "/bg.jpeg";

interface IHomeToDo {
  id: string;
  content: string;
  done: boolean;
}

export default function HomePage() {
  const [newToDoContent, setNewToDoContent] = React.useState("");
  const initialLoadComplete = React.useRef(false);
  const [search, setSearch] = React.useState("");
  const [newToDos, setNewToDos] = React.useState<IHomeToDo[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const hasMorePages = totalPages > page;
  const [isLoading, setIsLoading] = React.useState(true);

  const homeToDos = todoController.fuilterToDosByContent<IHomeToDo>(
    search,
    newToDos
  );
  const hasNoToDo = homeToDos.length === 0 && !isLoading;

  React.useEffect(() => {
    if (!initialLoadComplete.current) {
      todoController
        .get({ page })
        .then(({ todos, pages }) => {
          setNewToDos(todos);
          setTotalPages(pages);
        })
        .finally(() => {
          setIsLoading(false);
          initialLoadComplete.current = true;
        });
    }
  }, []);

  return (
    <main>
      <GlobalStyles themeName="indigo" />
      <header
        style={{
          backgroundImage: `url("${bg}")`,
        }}
      >
        <div className="typewriter">
          <h1>O que fazer hoje?</h1>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            todoController.create({
              content: newToDoContent,
              onError() {
                alert("Você precisa ter uma tarefa!");
              },
              onSuccess(todo: IHomeToDo) {
                setNewToDos((oldTodos) => {
                  return [todo, ...oldTodos];
                });
              },
            });
            setNewToDoContent("");
          }}
        >
          <input
            name="add-todo"
            type="text"
            placeholder="Correr, Estudar..."
            value={newToDoContent}
            onChange={function newToDoHandle(event) {
              setNewToDoContent(event.target.value);
            }}
          />
          <button type="submit" aria-label="Adicionar novo item">
            +
          </button>
        </form>
      </header>

      <section>
        <form>
          <input
            type="text"
            placeholder="Filtrar lista atual, ex: Dentista"
            onChange={function handleSearch(event) {
              setSearch(event.target.value);
            }}
          />
        </form>

        <table border={1}>
          <thead>
            <tr>
              <th align="left">
                <input type="checkbox" disabled />
              </th>
              <th align="left">Id</th>
              <th align="left">Conteúdo</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {homeToDos.map((toDo) => {
              return (
                <tr key={toDo.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={toDo.done}
                      onChange={function handleToggle() {
                        todoController.toggleDone({
                          id: toDo.id,
                          updateToDoOnScreen() {
                            setNewToDos((currentTodos) => {
                              return currentTodos.map((currentTodo) => {
                                if (currentTodo.id === toDo.id) {
                                  return {
                                    ...currentTodo,
                                    done: !currentTodo.done,
                                  };
                                }
                                return currentTodo;
                              });
                            });
                          },
                          onError() {
                            alert("Falha ao atualizar a TODO :(");
                          },
                        });
                      }}
                    />
                  </td>
                  <td>{toDo.id.substring(0, 4)}</td>
                  <td>
                    {!toDo.done && toDo.content}
                    {toDo.done && <s>{toDo.content}</s>}
                  </td>
                  <td align="right">
                    <button
                      data-type="delete"
                      onClick={function deleteToDo() {
                        todoController.deleteById(toDo.id);
                        setNewToDos((currentToDos) => {
                          return currentToDos.filter((currentToDo) => {
                            if (currentToDo.id === toDo.id) {
                              return false;
                            }
                            return true;
                          });
                        });
                      }}
                    >
                      Apagar
                    </button>
                  </td>
                </tr>
              );
            })}

            {isLoading && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: "center" }}>
                  Carregando...
                </td>
              </tr>
            )}

            {hasNoToDo && (
              <tr>
                <td colSpan={4} align="center">
                  Nenhum item encontrado
                </td>
              </tr>
            )}

            {hasMorePages && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: "center" }}>
                  <button
                    data-type="load-more"
                    onClick={() => {
                      setIsLoading(true);
                      const nextPage = page + 1;
                      setPage(nextPage);
                      todoController
                        .get({ page: nextPage })
                        .then(({ todos, pages }) => {
                          setNewToDos((oldToDos) => {
                            return [...oldToDos, ...todos];
                          });
                          setTotalPages(pages);
                        })
                        .finally(() => setIsLoading(false));
                    }}
                  >
                    Página {page} Carregar mais{" "}
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: "4px",
                        fontSize: "1.2em",
                      }}
                    >
                      ↓
                    </span>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
