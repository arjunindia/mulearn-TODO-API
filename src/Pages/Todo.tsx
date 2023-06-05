import {useEffect,useState,useRef,InputHTMLAttributes, FormEventHandler, ChangeEventHandler, MouseEventHandler} from 'react';
import {useLocation} from "wouter";
import {v4 as uuid,} from "uuid";

type Todo = {
    id:string,
    text:string,
    completed:boolean
}
export default function Todo() {
    const todoVar = localStorage.getItem("todosapi") ? JSON.parse(localStorage.getItem("todosapi")!) : [];
    const [_, setLocation] = useLocation();
    const [todos, setTodos] = useState<{id:string,text:string,completed:boolean}[]>(todoVar);
    const [visibleTodos, setVisibleTodos] = useState<{id:string,text:string,completed:boolean}[]>(todoVar);
    const [filter, setFilter] = useState<"all"|"active"|"completed">("all");
    const checkRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    function fetchTodos(){
        console.log(JSON.parse(localStorage.getItem("user")!));
        fetch(
            "https://mulearn-internship-task-production.up.railway.app/api/todo/",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${JSON.parse(localStorage.getItem("user")!).access}`,
                },
            }
        )
            .then((res) => res.json())
            .then((data) => handleResponse(data))
            .catch((err) => console.log(err));
    };
    function handleResponse(data: {id?:number,title?:string,isComplteted?:boolean}[]&{detail?:string}){
        console.log(data);
        if(data.detail){
            console.log(data.detail);
            setLocation("/login");
            return;
        }
        if(data.length){
            const todos = data.map((todo) => {
                return {
                    id:`${todo.id}`,
                    text:todo.title!,
                    completed:todo.isComplteted!
                }
            })

            setTodos(todos);
        }
    }
    const setItem = (todos: Todo[]) => {
        localStorage.setItem("todos", JSON.stringify(todos));
    }
    useEffect(() => {
        if (!localStorage.getItem("user")) {
            setLocation("/login");
        }
        fetchTodos();
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


    const newTodo = (text: string) => {
        fetch("https://mulearn-internship-task-production.up.railway.app/api/todo/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JSON.parse(localStorage.getItem("user")!).access}`,
            },
            body: JSON.stringify({
                title: text,
            })
        })
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
                    completed: data.isComplteted
                }
                setTodos([...todos, todo]);
            })

    }
    const updateTodo = (id: string) => {
        fetch(`https://mulearn-internship-task-production.up.railway.app/api/todo/${id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JSON.parse(localStorage.getItem("user")!).access}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.detail) {
                    console.log(data.detail);
                    setLocation("/login");
                    return;
                }
                const newTodos = todos.map((todo) => {
                    if (todo.id === id) {
                        todo.completed = !todo.completed;
                    }
                    return todo;
                });
                setTodos(newTodos);
            })
    }
    const deleteTodo = (id: string) => {
        fetch(`https://mulearn-internship-task-production.up.railway.app/api/todo/${id}/`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JSON.parse(localStorage.getItem("user")!).access}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.detail) {
                    console.log(data.detail);
                    setLocation("/login");
                    return;
                }

                const newTodos = todos.filter((todo) => todo.id !== id);
                setTodos(newTodos);
            })
    }

    const handleSubmit:FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        if (inputRef.current?.value) {
            newTodo(
                inputRef.current.value
            );
            inputRef.current.value = "";
        }
    }
    return (
        <><div className="header">

        <h1>Todo</h1>
        
        <button className="logout" onClick={() => {
            localStorage.removeItem("user");
            setLocation("/login");
        }}>Logout</button>
        </div>
        <form className="todo__input__form" onSubmit={handleSubmit}>
        <Checkbox checkRef={checkRef} />
        <input type="text" ref={inputRef} className="todo__input" required />
        <button type="submit" className="todo__submit">Add</button>
        </form>
        <div className="todo__list">
        {visibleTodos.map((todo) => (
            <div className="todo__item" key={todo.id} data-id={todo.id}>
            <Checkbox defaultChecked={todo.completed} onChange={()=>{
                updateTodo(`${todo.id}`);
            }} />
            <p className={`todo__text ${todo.completed && 'todo__strike'}`}>{todo.text}</p>
            <button className="todo__delete" onClick={()=>{
                deleteTodo(`${todo.id}`)
            }}>X</button>
            </div>
        ))}
        <div className='todo__actions'>
            <p>{todos.length} items left</p>
            <div className='todo__filters'>
                <button className={`todo__filter ${filter === "all" && "todo__filter--active"}`} onClick={() => setFilter("all")}>All</button>
                <button className={`todo__filter ${filter === "active" && "todo__filter--active"}`} onClick={() => setFilter("active")}>Active</button>
                <button className={`todo__filter ${filter === "completed" && "todo__filter--active"}`} onClick={() => setFilter("completed")}>Completed</button>
            </div>
            <button className="todo__clear" onClick={()=>{
                const newTodos = todos.filter((todo) => todo.completed);
                newTodos.forEach((todo) => {
                    deleteTodo(`${todo.id}`);
                })
            }}>Clear Completed</button>
        </div>
        </div>
        </>
    )
}

function Checkbox({checkRef,...props}: InputHTMLAttributes<HTMLInputElement>& {checkRef?:React.RefObject<HTMLInputElement>} ){
    return(
        <label className="mcui-checkbox">
        <input type="checkbox" ref={checkRef} {...props}/>
        <div>
          <svg className="mcui-check" viewBox="-2 -2 35 35" aria-hidden="true">
            <title>checkmark-circle</title>
            <polyline points="7.57 15.87 12.62 21.07 23.43 9.93" />
          </svg>
        </div>
        <div/>
      </label>
    )
}