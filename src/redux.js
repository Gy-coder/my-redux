import React, { createContext, useContext, useEffect, useState } from "react";

let state = undefined;
let reducer = undefined;
let listeners = [];
const setState = (newState) => {
  state = newState;
  listeners.forEach((fn) => fn(state));
};

const store = {
  getState() {
    return state;
  },
  dispatch: (action) => {
    setState(reducer(state, action));
  },
  subscribe(fn) {
    listeners.push(fn);
    return () => {
      const index = listeners.indexOf(fn);
      listeners.splice(index, 1);
    };
  },
};

let preDispatch = store.dispatch;

store.dispatch = (action) => {
  if (typeof action === "function") {
    action(store.dispatch);
  } else {
    preDispatch(action);
  }
};

const preDispatch2 = store.dispatch;

store.dispatch = (action) => {
  if (action.payload instanceof Promise) {
    action.payload.then((data) => store.dispatch({ ...action, payload: data }));
  } else {
    preDispatch2(action);
  }
};

const changed = (oldState, newState) => {
  let isChange = false;
  for (let key in oldState) {
    if (oldState[key] !== newState[key]) {
      isChange = true;
    }
  }
  return isChange;
};

export const connect = (selector, mapDispatchToProps) => (Component) => {
  return (props) => {
    const store = useContext(appContext);
    const [, update] = useState({});
    const data = selector ? selector(state) : { state: state };
    const dispatchers = mapDispatchToProps
      ? mapDispatchToProps(store.dispatch)
      : { dispatch: store.dispatch };
    useEffect(() => {
      const unsubscribe = store.subscribe(() => {
        const newData = selector ? selector(state) : { state: state };
        if (changed(data, newData)) {
          update({});
        }
      });
      return unsubscribe;
    }, [selector]);
    return <Component {...props} {...data} {...dispatchers} />;
  };
};

export const createStore = (_reducer, initState) => {
  state = initState;
  reducer = _reducer;
  return store;
};

const appContext = createContext(null);

export const Provider = ({ store, children }) => {
  return <appContext.Provider value={store}>{children}</appContext.Provider>;
};
