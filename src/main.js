// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia' // <-- Importe o Pinia
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia() // <-- Crie a instância do Pinia

app.use(router)
app.use(pinia) // <-- Diga ao app para usar o Pinia

app.mount('#app')