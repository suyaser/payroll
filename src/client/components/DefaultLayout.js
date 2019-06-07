import React from "react";
import {
  BrowserRouter as Router,
  Route,
  browserHistory
} from "react-router-dom";

import Dashboard from "./Dashboard";

import { AppFooter, AppHeader } from "@coreui/react";

import SideBar from "./SideBar";
import DefaultFooter from "./DefaultFooter";
import DefaultHeader from "./DefaultHeader";

class DefaultLayout extends React.Component {
  render() {
    return (
      <div className="app">
        <AppHeader fixed>
          <DefaultHeader />
        </AppHeader>
        <div className="app-body">
          <SideBar />
          <main className="main">
            <Router history={browserHistory}>
              <div>
                <Route
                  exact
                  path="/"
                  name="Dashboard"
                  component={Dashboard}
                />
              </div>
            </Router>
          </main>
        </div>
        <AppFooter>
          <DefaultFooter />
        </AppFooter>
      </div>
    );
  }
}

export default DefaultLayout;
