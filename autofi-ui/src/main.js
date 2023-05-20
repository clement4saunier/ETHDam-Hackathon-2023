import './assets/main.css';
import 'element-plus/dist/index.css'

import axios from 'axios';
import { createApp } from 'vue'
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';

import App from './App.vue';
import router from './router';

axios.defaults.baseURL = 'http://localhost:3000';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ElementPlus);

app.mount('#app');
