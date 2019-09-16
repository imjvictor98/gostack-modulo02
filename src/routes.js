/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable eol-last */
/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */

import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware); // autenticacao será usado após as rotas abaixo desse middleware

routes.put('/users', UserController.update);

export default routes;
