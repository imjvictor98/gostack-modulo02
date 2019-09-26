/* eslint-disable max-len */
/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable eol-last */
/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */

import { Op } from 'sequelize';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      // verifica se o usuário é um fornecedor
      where: {
        id: req.userId,
        provider: true,
      },
    });

    if (!checkUserProvider) {
      // senão for um fornecedor, envia um erro
      return res.status(401).json({ error: 'User is not a provider' });
    }

    const { date } = req.query; // recupera a data passado na query string
    const parsedDate = parseISO(date); // transforma o date em um tipo Date() javascript

    const appointments = await Appointment.findAll({
      // procura em todos os agendamentos
      where: {
        // aonde
        provider_id: req.userId, // o id do fornecedor é o id que o usuario esta logado
        canceled_at: null, // e o agendamento nao foi cancelado
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
          // e o agendamentro esta dentro do range do comeco do dia ate o final do dia
        },
      },
      include: [
        // inclui
        {
          model: User, // a partir do model Usuario
          as: 'user', // tabela user no banco de dados
          attributes: ['name'], // mostra os atributos: nome
        },
      ],
      order: ['date'], // ordenado pela data
    });

    return res.json(appointments); // retorna os agendamentos em json
  }
}

export default new ScheduleController();
