import React from "react";
import "./App.css";
import { Provider, createStore, connect } from "./redux";
import { connectToUser } from "./connect/connect";

const reducer = (state, { type, payload }) => {
  if (type === "updateUser") {
    return {
      ...state,
      user: { ...state.user, ...payload },
    };
  } else {
    return state;
  }
};
let store = createStore(reducer, {
  user: { name: "jack", age: "19" },
  group: { name: "前端组" },
});

const App = () => {
  return (
    <Provider store={store}>
      <大儿子 />
      <二儿子 />
      <小儿子 />
    </Provider>
  );
};

const 大儿子 = () => (
  <section>
    大儿子
    <User />
  </section>
);
const 二儿子 = () => (
  <section>
    二儿子
    <UserModifier>内容</UserModifier>
  </section>
);
const 小儿子 = connect((state) => {
  return { group: state.group };
})(({ group }) => {
  console.log("小儿渲染了" + Math.random());
  return (
    <section>
      小儿子 <span>{group.name}</span>
    </section>
  );
});

const User = connectToUser(({ user }) => {
  return <span>user:{user.name}</span>;
});

const ajax = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ data: { name: "3秒后的frank" } });
    }, 3000);
  });
};

const fetchUser = (dispatch) => {
  ajax("/user").then((response) => {
    dispatch({ type: "updateUser", payload: response.data });
  });
};

const UserModifier = connect(
  null,
  null
)(({ state, dispatch }) => {
  // const onChange = (e) => {
  //   updateUser({ name: e.target.value });
  // };
  const onClick = (e) => {
    // dispatch(fetchUser);
    // fetchUser(dispatch);
    dispatch({
      type: "updateUser",
      payload: ajax("/user").then((response) => response.data),
    });
  };
  return (
    <>
      {/* {children}: */}
      {/* <input type="text" value={user.name} onChange={onChange} /> */}
      <div>User: {state.user.name}</div>
      <button onClick={onClick}>异步获取 user</button>
    </>
  );
});

export default App;
