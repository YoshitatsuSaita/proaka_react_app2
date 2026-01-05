import React, { useState, useEffect } from 'react';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from './api';

export interface Todo {
  content: string;//プロパティcontentは文字列
  readonly id: number;//書き換えられない一意なkey
  completed_flg: boolean; // 完了/未完了 (= true or false) を表すので型は Boolean型 
  delete_flg: boolean, // 削除/未削除 (= true or false) を表すので型は Boolean型 
};

type Filter = 'all' | 'completed' | 'unchecked' | 'delete'; // <-- 追加


//Todoコンポーネントの定義
const Todo: React.FC =()=>{
  const [todos, setTodos]=useState<Todo[]>([]);//Todo配列のステートを保持
  const [text, setText]=useState('');
  const [nextId, setNextId] = useState(1); // 次のTodoのIDを保持するステート
  const [filter, setFilter] = useState<Filter>('all');//todoのフィルタ状態を保持する

  const isFormDisabled = filter === 'completed' || filter === 'delete';

  const handleFilterChange = (filter: Filter) => {
    setFilter(filter);
  };

  // コンポーネントマウント時にRails APIからデータを取得_追加
  useEffect(() => {
    fetchTodos().then(data => setTodos(data)); // 全てのタスクを取得
  }, []);

// 新しいTodoを作成する関数
const handleSubmit = () => {
  if (!text) return;

  const newTodo: Omit<Todo, 'id'> = {
    content: text,
    completed_flg: false,
    delete_flg: false,
  };

  createTodo(newTodo).then(data => {
    setTodos((prevTodos) => [data, ...prevTodos]);
    setNextId(nextId + 1); // 次のTodoIDをインクリメント
    setText(''); // フォームの入力をクリア
  });
};

   // フィルタリングされたタスクリストを取得する関数
 const getFilteredTodos = () => {
  switch (filter) {
    case 'completed':
      // 完了済み **かつ** 削除されていないタスクを返す
      return todos.filter((todo) => todo.completed_flg && !todo.delete_flg);
    case 'unchecked':
      // 未完了 **かつ** 削除されていないタスクを返す
      return todos.filter((todo) => !todo.completed_flg && !todo.delete_flg);
    case 'delete':
      // 削除されたタスクを返す
      return todos.filter((todo) => todo.delete_flg);
    default:
      // 削除されていないすべてのタスクを返す
      return todos.filter((todo) => !todo.delete_flg);
  }
};

// 特定のTodoのプロパティを更新する関数
const handleTodo = <K extends keyof Todo, V extends Todo[K]>(
  id: number,
  key: K,
  value: V
) => {
  const updatedTodos = todos.map(todo =>
    todo.id === id ? { ...todo, [key]: value } : todo
  );

  setTodos(updatedTodos);

  const todo = updatedTodos.find(todo => todo.id === id);
  if (todo) {
    updateTodo(id, todo);
  }
};

  // const updateTodo = <T extends keyof Todo>(todos: Todo[], id: number, key: T, value: Todo[T]): Todo[] => {
  //   return todos.map((todo) => {
  //     if (todo.id === id) {
  //       return { ...todo, [key]: value };
  //     }
  //     return todo;
  //   });
  // };

  // // 共通の更新関数を使用したイベント処理関数
  // const handleEdit = (id: number, value: string) => {
  //   setTodos((todos) => updateTodo(todos, id, 'content', value));
  // };

  // const handleCheck = (id: number, completed_flg: boolean) => {
  //   setTodos((todos) => updateTodo(todos, id, 'completed_flg', completed_flg));
  // };

  // const handleRemove = (id: number, delete_flg: boolean) => {
  //   setTodos((todos) => updateTodo(todos, id, 'delete_flg', delete_flg));
  // };

// 物理的に削除する関数
const handleEmpty = () => {
  const filteredTodos = todos.filter(todo => !todo.delete_flg);
  const deletePromises = todos
    .filter(todo => todo.delete_flg)
    .map(todo => deleteTodo(todo.id));

  Promise.all(deletePromises).then(() => setTodos(filteredTodos));
};




return (
  
  <div className="todo-container">
    <select
      defaultValue="all"
      onChange={(e) => handleFilterChange(e.target.value as Filter)}
    >
      <option value="all">すべてのタスク</option>
      <option value="completed">完了したタスク</option>
      <option value="unchecked">現在のタスク</option>
      <option value="delete">ごみ箱</option>
    </select>
    {/* フィルターが `delete` のときは「ごみ箱を空にする」ボタンを表示 */}
    {filter === 'delete' ? (
      <button onClick={handleEmpty}>
        ごみ箱を空にする
      </button>
    ) : (
      // フィルターが `completed` でなければ Todo 入力フォームを表示
      filter !== 'completed' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input
            type="text"
            value={text} // フォームの入力値をステートにバインド
            onChange={(e) => setText(e.target.value)} // 入力値が変わった時にステートを更新
          />
          <button type="submit">追加</button>
        </form>
      )
    )}
    <ul>
      {getFilteredTodos().map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            disabled={todo.delete_flg}
            checked={todo.completed_flg}
            onChange={() => handleTodo(todo.id, 'completed_flg', !todo.completed_flg)}
          />
          <input
            type="text"
            disabled={todo.completed_flg || todo.delete_flg}
            value={todo.content}
            onChange={(e) => handleTodo(todo.id, 'content', e.target.value)}
          />
          <button onClick={() => handleTodo(todo.id, 'delete_flg', !todo.delete_flg)}>
            {todo.delete_flg ? '復元' : '削除'}
          </button>
        </li>
      ))}
    </ul>
  </div>
);
};

export default Todo;