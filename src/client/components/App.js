import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

import DefaultLayout from "./DefaultLayout";

class App extends React.Component {
  render() {
    return (
      <HashRouter>
        <Switch>
          <Route path="/" name="Home" component={DefaultLayout} />
        </Switch>
      </HashRouter>
    );
  }
}

export default App;
