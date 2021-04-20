import React from "react";
import ReactDOM from 'react-dom';
import App from './App';

import './main.css';

// import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/themes/fluent-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const root = document.createElement('div');
root.classList.add('root-element')
document.body.appendChild(root);

ReactDOM.render(<App />, root);