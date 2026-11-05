import { registerRootComponent } from 'expo';
import './src/background'; // фоновая задача должна объявляться до запуска приложения
import App from './App';

registerRootComponent(App);
