import React from "react";
import logo from "./logo.svg";
import "./App.css";

let logoRetrieved;
let percent = 0;
let timeout;
let interval;
const reset = () => {
  clearTimeout(timeout);
  clearInterval(interval);
  logoRetrieved = undefined;
  percent = 0;
  timeout = undefined;
  interval = undefined;
};
const handlePercent = (component) => {
  interval = setInterval(() => {
    percent < 100 && (percent += 10);
    component.forceUpdate();
  }, 300);
};
const handleImageLoad = (component) => {
  timeout = setTimeout(() => {
    logoRetrieved = logo;
    component.forceUpdate();
    clearInterval(interval);
  }, 3000);
};

class App extends React.Component {
  componentDidMount() {
    reset();
    handlePercent(this);
    handleImageLoad(this);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {logoRetrieved && (
            <img
              id="main-image"
              src={logoRetrieved}
              className="App-logo"
              alt=""
            />
          )}
          <br />
          <p className="text">Skeleton View Example</p>
          {!logoRetrieved && (
            <p className="loading-text">
              {"Parsing index, downloading SPA, rendering image... " +
                percent +
                "%"}
            </p>
          )}
        </header>
      </div>
    );
  }
}

export default App;
