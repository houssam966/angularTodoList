import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Todo} from '../interfaces/todo';
import { catchError } from 'rxjs/operators';
import { throwError as observableThrowError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TodoService {
   todos: Todo[] = [];
   filter: string = 'all';
   todoTitle: string = ''; // title for the next item to add
   nextId: number = 4; // id for the next item
   beforeEditCache: string = '';
   anyRemainingModel: boolean = true;

   constructor( private http: HttpClient) {
    this.todos = this.getTodos();
  }

  getTodos(): Todo[] {
    this.http.get('http://localhost:3000/tasks')
      .pipe(catchError(this.errorHandler))
      .subscribe((response: any) => {
        this.todos = response;
      })

    return this.todos;
  }

  addTodo(todoTitle: string): void {
    if (todoTitle.trim().length === 0) {
      return;
    }

    this.http.post( 'http://localhost:3000/tasks', {
      id: this.nextId,
      label: todoTitle,
      done: false
    })
      .subscribe((response: any) => {
        this.todos.push({
          id: response.id,
          label: todoTitle,
          done: false,
          editing: false
        });
      });

    this.nextId++;
  }

  errorHandler(error: HttpErrorResponse) {
    return observableThrowError(error.message || 'Something went wrong!!!!');
  }
  todosFiltered(): Todo[] {
    if (this.filter === 'all') {
      return this.todos;
    } else if (this.filter === 'active') {
      return this.todos.filter(todo => !todo.done);
    } else if (this.filter === 'completed') {
      return this.todos.filter(todo => todo.done);
    }

    return this.todos;
  }
  onEdit(todo: Todo): void {
    this.beforeEditCache = todo.label;
    todo.editing = true;
  }

  doneEdit(todo: Todo): void {
    if (todo.label.trim().length === 0) {
      todo.label = this.beforeEditCache;
    }

    this.anyRemainingModel = this.anyRemaining();
    todo.editing = false;

    this.http.patch('http://localhost:3000/tasks/' + todo.id, {
      label: todo.label,
      done: todo.done
    })
      .subscribe((response: any) => {
      });
  }

  cancelEdit(todo: Todo): void {
    todo.label = this.beforeEditCache;
    todo.editing = false;
  }

  onDelete(id: number): void {
    this.http.delete('http://localhost:3000/tasks/' + id)
      .subscribe((response: any) => {
        this.todos = this.todos.filter(todo => todo.id !== id);
      })
  }

  getRemaining(): number {
    return this.todos.filter(todo => !todo.done).length;
  }

  anyRemaining(): boolean {
    return this.getRemaining() !== 0;
  }
}
