import {
  useEffect,
  useState,
  useRef,
  InputHTMLAttributes,
  FormEventHandler,
  memo,
  useCallback,
} from "react";
import { useLocation } from "wouter";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};
const once = (fn: () => void) => {
    let called = false;
    return () => {
        if (!called) {
        called = true;
        fn();
        }
    };
    }

export default function Todo() {
  const todoVar = localStorage.getItem("todosapi")
    ? JSON.parse(localStorage.getItem("todosapi")!)
    : [];
  const [_, setLocation] = useLocation();
  const [todos, setTodos] =
    useState<{ id: string; text: string; completed: boolean }[]>(todoVar);
  const [visibleTodos, setVisibleTodos] =
    useState<{ id: string; text: string; completed: boolean }[]>(todoVar);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const checkRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const getToken = () => {
    if (!localStorage.getItem("user")) {
      setLocation("/login");
      return;
    }
    return JSON.parse(localStorage.getItem("user")!).access;
  };
  let controller: AbortController | null = null;
  function fetchTodos() {
    controller = new AbortController();
    fetch(
      "https://mulearn-internship-task-production.up.railway.app/api/todo/",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => handleResponse(data))
      .catch((err) => console.log(err));
  }
  const handleResponse = (
    data: { id?: number; title?: string; isCompleted?: boolean }[] & {
      detail?: string;
    }
  ) => {
    if (data.detail) {
      console.log(data.detail);
      setLocation("/login");
      return;
    }
    if (data.length) {
      const todos = data.map((todo) => {
        return {
          id: `${todo.id}`,
          text: todo.title!,
          completed: todo.isCompleted!,
        };
      });

      setTodos(todos);
    }
  };
  const setItem = (todos: Todo[]) => {
    localStorage.setItem("todos", JSON.stringify(todos));
  };
  useEffect(() => {
    if (!localStorage.getItem("user")) {
      setLocation("/login");
    }
    fetchTodos();

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, []);
  useEffect(() => {
    if (filter === "all") {
      setVisibleTodos(todos);
    } else if (filter === "active") {
      setVisibleTodos(todos.filter((todo) => !todo.completed));
    } else if (filter === "completed") {
      setVisibleTodos(todos.filter((todo) => todo.completed));
    }
  }, [filter, todos]);

  useEffect(() => {
    setItem(todos);
  }, [todos]);

  const newTodo = useCallback((text: string) => {
    fetch(
      "https://mulearn-internship-task-production.up.railway.app/api/todo/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${getToken()}`,
        },
        body: new URLSearchParams({
          title: text,
        }).toString(),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.detail) {
          console.log(data.detail);
          setLocation("/login");
          return;
        }

        const todo = {
          id: `${data.id}`,
          text: data.title,
          completed: data.isComplteted,
        };
        setTodos((todos) => [todo,...todos]);
      });
  }, [todos]);
  const updateTodo = useCallback(
    (id: string) => {
      fetch(
        `https://mulearn-internship-task-production.up.railway.app/api/todo/${id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.detail) {
            console.log(data.detail);
            setLocation("/login");
            return;
          }
          setTodos((todos) =>(
            todos.map((todo) => {
              if (todo.id === id) {
                return {
                  ...todo,
                  completed: !todo.completed,
                };
              }
              return todo;
            })
          ));
        });
    },
    [todos]
  );
  const deleteTodo = useCallback((id: string) => {
    fetch(
      `https://mulearn-internship-task-production.up.railway.app/api/todo/${id}/`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.detail) {
          console.log(data.detail);
          setLocation("/login");
          return;
        }
        setTodos((todos) => todos.filter((todo) => todo.id !== id));
      });
  }, [todos]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (inputRef.current?.value) {
      newTodo(inputRef.current.value);
      inputRef.current.value = "";
    }
  };
  return (
    <>
      <div className="header">
        <h1>Todo</h1>

        <button
          className="logout"
          onClick={() => {
            localStorage.removeItem("user");
            setLocation("/login");
          }}
        >
          Logout
        </button>
      </div>
      <form className="todo__input__form" onSubmit={handleSubmit}>
        <Checkbox
          title="Cannot Preset todo completion now"
          disabled
          style={{ opacity: "0.2", cursor: "not-allowed" }}
          checkRef={checkRef}
        />
        <input type="text" ref={inputRef} className="todo__input" required />
        <button type="submit" className="todo__submit">
          Add
        </button>
      </form>
      <div className="todo__list">
        {visibleTodos.map((todo) => (
          <div className="todo__item" key={todo.id} data-id={todo.id}>
            <Checkbox
              defaultChecked={todo.completed}
              onChange={() => {
                updateTodo(`${todo.id}`);
              }}
            />
            <p className={`todo__text ${todo.completed && "todo__strike"}`}>
              {todo.text}
            </p>
            <button
              className="todo__delete"
              onClick={Object.assign(
                once(() => {
                  deleteTodo(`${todo.id}`);
                }),
                undefined
              )}
            >
              X
            </button>
          </div>
        ))}
        <div className="todo__actions">
          <p>{todos.length} items left</p>
          <div className="todo__filters">
            <button
              className={`todo__filter ${
                filter === "all" && "todo__filter--active"
              }`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`todo__filter ${
                filter === "active" && "todo__filter--active"
              }`}
              onClick={() => setFilter("active")}
            >
              Active
            </button>
            <button
              className={`todo__filter ${
                filter === "completed" && "todo__filter--active"
              }`}
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
          </div>
          <button
            className="todo__clear"
            onClick={() => {
              const newTodos = todos.filter((todo) => todo.completed);
              newTodos.forEach((todo) => {
                    deleteTodo(`${todo.id}`);
              });
            }}
          >
            Clear Completed
          </button>
        </div>
      </div>
    </>
  );
}

const Checkbox = memo(
  ({
    checkRef,
    style,
    title,
    ...props
  }: InputHTMLAttributes<HTMLInputElement> & {
    checkRef?: React.RefObject<HTMLInputElement>;
    title?: string;
  }) => {
    return (
      <label className="mcui-checkbox">
        <input type="checkbox" ref={checkRef} {...props} />
        <div>
          <svg
            style={style}
            className="mcui-check"
            viewBox="-2 -2 35 35"
            aria-hidden="true"
          >
            <title>{title || "checkmark-circle"}</title>
            <polyline points="7.57 15.87 12.62 21.07 23.43 9.93" />
          </svg>
        </div>
        <div />
      </label>
    );
  }
);
