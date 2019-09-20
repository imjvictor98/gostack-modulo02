/* eslint-disable no-trailing-spaces */
/* eslint-disable indent */
/* eslint-disable no-tabs */
import express from 'express';
import path from 'path';
import routes from './routes';

import './database';

class App {
  // eslint-disable-next-line no-trailing-spaces
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
