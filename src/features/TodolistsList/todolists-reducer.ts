import { todolistsAPI, TodolistType } from "api/todolists-api"
import { handleServerNetworkError } from "utils/error-utils"
import { AppThunk } from "app/store"
import { appActions, RequestStatusType } from "app/app-reducer"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const slice = createSlice({
  name: "todolists",
  initialState: [] as TodolistDomainType[],
  reducers: {
    removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
      // 1 variant
      // return state.filter((tl) => tl.id !== action.payload.id)

      // 2 variant
      const index = state.findIndex((todo) => todo.id === action.payload.id)
      if (index !== -1) {
        state.splice(index, 1)
      }
    },
    addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
      const newTodo: TodolistDomainType = { ...action.payload.todolist, filter: "all", entityStatus: "idle" }
      state.unshift(newTodo)
    },
    changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
      // return state.map((tl) => (tl.id === action.id ? { ...tl, title: action.title } : tl))
      // 1 variant
      // const index = state.findIndex((todo) => todo.id === action.payload.id)
      // if (index !== -1) {
      //   state[index].title = action.payload.title
      // }

      // 2 variant
      const todolist = state.find((todo) => todo.id === action.payload.id)
      if (todolist) {
        todolist.title = action.payload.title
      }
    },
    changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
      const todolist = state.find((todo) => todo.id === action.payload.id)
      if (todolist) {
        todolist.filter = action.payload.filter
      }
    },
    changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string; status: RequestStatusType }>) => {
      const todolist = state.find((todo) => todo.id === action.payload.id)
      if (todolist) {
        todolist.entityStatus = action.payload.status
      }
    },
    setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
      // 1 variant
      return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))

      // 2 variant
      // action.payload.todolists.forEach((tl) => {
      //   state.push({ ...tl, filter: "all", entityStatus: "idle" })
      // })
    },
  },
})

export const todolistsActions = slice.actions
export const todolistsReducer = slice.reducer

// thunks
export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }))
    todolistsAPI
      .getTodolists()
      .then((res) => {
        dispatch(todolistsActions.setTodolists({ todolists: res.data }))
        dispatch(appActions.setAppStatus({ status: "succeeded" }))
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch)
      })
  }
}
export const removeTodolistTC = (id: string): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }))
    dispatch(todolistsActions.changeTodolistEntityStatus({ id, status: "loading" }))
    todolistsAPI.deleteTodolist(id).then(() => {
      dispatch(todolistsActions.removeTodolist({ id }))
      dispatch(appActions.setAppStatus({ status: "succeeded" }))
    })
  }
}
export const addTodolistTC = (title: string): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }))
    todolistsAPI.createTodolist(title).then((res) => {
      dispatch(todolistsActions.addTodolist({ todolist: res.data.data.item }))
      dispatch(appActions.setAppStatus({ status: "succeeded" }))
    })
  }
}
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
  return (dispatch) => {
    todolistsAPI.updateTodolist(id, title).then(() => {
      dispatch(todolistsActions.changeTodolistTitle({ id, title }))
    })
  }
}

export type FilterValuesType = "all" | "active" | "completed"
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}
