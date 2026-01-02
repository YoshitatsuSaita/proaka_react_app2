import React,{useState} from "react";

//"Todo"型の定義をコンポーネント外で行う
type Todo={
  content: string;//プロパティcontentは文字列
  readonly id: number;//書き換えられない一意なkey
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
      content: text, //textステートの値をcontentプロパティへ
      id: nextId,
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
  // todosステートの書き換えがあるかをチェック
    console.log('=== Original todos ===');
    todos.map((todo) => {
      console.log(`id: ${todo.id}, value: ${todo.content}`);
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
          value={text}
          onChange={(e) =>setText(e.target.value)}
        />
        <input
          type="submit"
          value="追加"
        />
        {/* ボタンをクリックしてもonSubmitをトリガーしない */}
      </form>
      <ul>
        {todos.map((todo)=>{
          return (
          <li key={todo.id}>
            <input
            type="text"
            value={todo.content}
            onChange={(e) => handleEdit(todo.id, e.target.value)}
            />  
          </li>//todoのリストを表示
          );
        })}
      </ul>
    </div>
  );
};

export default Todo;