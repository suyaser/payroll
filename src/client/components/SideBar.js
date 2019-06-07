import React from "react";

class SideBar extends React.Component {
  render() {
    return (
      <div className="sidebar">
        <nav className="sidebar-nav">
          <ul className="nav">
            <a className="nav-link" href="/">
              <li className="nav-title">Payroll</li>
            </a>
          </ul>
        </nav>
      </div>
    );
  }
}

export default SideBar;
