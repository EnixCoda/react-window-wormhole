import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'
import './App.css';
import { Child } from './Child';
import { Home } from './Home';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/home" component={Home} />
        <Route path="/child" component={Child} />
        <Redirect to="/home" />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
