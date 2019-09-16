/* eslint-disable no-trailing-spaces */
/* eslint-disable indent */
/* eslint-disable no-tabs */
import express from 'express';
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
	}

  routes() {
	this.server.use(routes);
	}
}

export default new App().server;
