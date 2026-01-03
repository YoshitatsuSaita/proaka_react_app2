import React, { useState, useEffect } from 'react';
import localforage from 'localforage';

//"Todo"型の定義をコンポーネント外で行う
type Todo={
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
 
// todosステートを更新する関数
  const handleSubmit = ()=>{
    // 無入力の場合リターン
    if(!text) return;
    //新しいTodo作成
    const newTodo: Todo ={
      content: text, // text ステートの値を content プロパティへ
      id: nextId,
     // 初期値は false
      completed_flg: false,
      delete_flg: false, 
    };
    /**
     * 更新前の todos ステートを元に
     * スプレッド構文で展開した要素へ
     * newTodo を加えた新しい配列でステートを更新
     **/
    setTodos((prevTodos) => [newTodo, ...prevTodos]);
    setNextId(nextId + 1); //次のIDを更新
    setText('');//フォームのリセット
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

const handleTodo = <K extends keyof Todo, V extends Todo[K]>(
    id: number,
    key: K,
    value: V
  ) => {
    setTodos((todos) => {
      const newTodos = todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, [key]: value };
        } else {
          return todo;
        }
      });
  
      return newTodos;
    });
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

  const handleFilterChange = (filter: Filter) => {
    setFilter(filter);
  };

const isFormDisabled = filter === 'completed' || filter === 'delete';

// 物理的に削除する関数
const handleEmpty = () => {
  setTodos((todos) => todos.filter((todo) => !todo.delete_flg));
};

// useEffect フックを使ってコンポーネントのマウント時にデータを取得
useEffect(() => {
  localforage.getItem('todo-20240622').then((values) => {
    if (values) {
      setTodos(values as Todo[]);
    }
  });
}, []);


// useEffect フックを使って todos ステートが更新されるたびにデータを保存
useEffect(() => {
  localforage.setItem('todo-20240622', todos);
}, [todos]);


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