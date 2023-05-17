const BASE_URL = "http://localhost:3000";

describe("/ - todos feed", () => {
  it("when load, renders the page", () => {
    cy.visit(BASE_URL);
  });
  it("when create a new todo, it must appears in the screen", () => {
    cy.intercept("POST", `${BASE_URL}/api/todos`, (request) => {
      request.reply({
        statusCode: 201,
        body: {
          todo: {
            id: "cc66a48b-a6cf-4c83-9744-1d5e7e7fb350",
            content: "Test todo",
            date: "2023-05-15T21:10:45.663Z",
            done: false,
          },
        },
      });
    }).as("createTodo");
    cy.visit(BASE_URL);
    cy.get("input[name='add-todo']").type("Test todo");
    cy.get("[aria-label= 'Adicionar novo item']").click();
    cy.contains("Test todo");
  });
});
