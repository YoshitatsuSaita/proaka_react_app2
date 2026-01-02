import React,{useState} from "react";

//"Todo"型の定義をコンポーネント外で行う
type Todo={
  content: string;//プロパティcontentは文字列
  readonly id: number;//書き換えられない一意なkey
  completed_flg: boolean; // 完了/未完了 (= true or false) を表すので型は Boolean型 
  delete_flg: boolean, // 削除/未削除 (= true or false) を表すので型は Boolean型 
};

//Todoコンポーネントの定義
const Todo: React.FC =()=>{
  const [todos, setTodos]=useState<Todo[]>([]);//Todo配列のステートを保持
  const [text, setText]=useState('');
  const [nextId, setNextId] = useState(1); // 次のTodoのIDを保持するステート
 
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

  const handleEdit = (id: number, value: string) => {
  setTodos((todos) => {
    /**
     * 引数として渡された todo の id が一致する
     * 更新前の todos ステート内の todo の
     * value プロパティを引数 value (= e.target.value) に書き換える
     */
  const newTodos = todos.map((todo) => {
    if (todo.id === id) {
      //  新オブジェクトを作成して返す
      return {...todo,content : value };
    }
    return todo;
  });
  // todosステートの書き換えがあるかどうかチェック
    console.log('=== Original todos ===');
    todos.map((todo) => {
      console.log(`id: ${todo.id}, value: ${todo.content}`);
    });

  return newTodos;
  });
};

  const handleCheck = (id: number, completed_flg: boolean) => {
    setTodos((todos) => {
      const newTodos = todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, completed_flg };
        }
        return todo;
      });

    return newTodos;
  });
};

const handleRemove = (id: number, delete_flg: boolean) => {
  setTodos((todos) => {
    const newTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, delete_flg };
      }
      return todo;
    });


    return newTodos;
  });
};

  return (
    <div>
      <form 
        onSubmit={(e) => {
          e.preventDefault();//デフォルト動作の無効化
          handleSubmit();//handleSubmit 関数を呼び出す
        }}
      >
        <input
          type="text"
          value={text} // フォームの入力値をステートにバインド
          onChange={(e) =>setText(e.target.value)}// 入力値が変わった時にステートを更新
        />
        <input
          type="submit"
          value="追加"
        />{/* ボタンをクリックしてもonSubmitをトリガーしない */}
      </form>
      <ul>
        {todos.map((todo)=>{
          return (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed_flg}
              // 呼び出し側で checked フラグを反転させる
              onChange={() => handleCheck(todo.id, !todo.completed_flg)}
            />
            <input
            type="text"
            value={todo.content}
            disabled={todo.completed_flg}
            onChange={(e) => handleEdit(todo.id, e.target.value)}
            />  
            <button onClick={() => handleRemove(todo.id, !todo.delete_flg)}>
             {todo.delete_flg ? '復元' : '削除'}
            </button>
          </li>//todoのリストを表示
          );
        })}
      </ul>
    </div>
  );
};

export default Todo;