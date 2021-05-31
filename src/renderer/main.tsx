import React from "react";
import ReactDOM from 'react-dom';
import App from './App';

//: primereact theme and css file
// import 'primereact/resources/themes/saga-blue/theme.css';
import "../../node_modules/primereact/resources/primereact.min.css";
import "../../node_modules/primereact/resources/themes/fluent-light/theme.css";

//: prime icons
import "../../node_modules/primeicons/primeicons.css";

//: primeflex
import "../../node_modules/primeflex/primeflex.css";

//: main css file (+tailwindcss in it)
import './main.css';
import './tailwind.css';

import { Contexts } from "./Contexts";

const root = document.createElement('div');
root.classList.add('root-element')
document.body.appendChild(root);

ReactDOM.render(<Contexts><App /></Contexts>, root);

if (module.hot) {
    module.hot.accept();
}