import React from "react";
import ReactDOM from 'react-dom';
import App from './App';

//: primereact theme and css file
// import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/themes/fluent-light/theme.css';
import 'primereact/resources/primereact.min.css';

//: prime icons
import 'primeicons/primeicons.css';

//: primeflex
import 'primeflex/primeflex.css';

//: main css file (+tailwindcss in it)
import './main.css';

//: tailwind css
// import './tailwind.css';

const root = document.createElement('div');
root.classList.add('root-element')
document.body.appendChild(root);

ReactDOM.render(<App />, root);