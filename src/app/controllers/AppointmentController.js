/* eslint-disable max-len */
/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable eol-last */
/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
import * as yup from 'yup';
import pt from 'date-fns/locale/pt';
import {
 startOfHour, parseISO, isBefore, format, subHours
} from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';


class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query; // verifica a pagina que esta na query string, se nenhuma foi informada, recebe 1
    const appointments = await Appointment.findAll({
      // busca todos os agendamentos
      where: { user_id: req.userId, canceled_at: null }, // aonde o usuario é o usuario que esta logado e se os agendamentos nao estao cancelados
      order: ['date'], // ordenado por ordem
      attributes: ['id', 'date'], // mostrando os atributos id e data
      limit: 20, // limite de 20 agendamentos por pagina
      offset: (page - 1) * 20, // logica para mostrar os agendamentos por paginação
      include: [
        // incluindo
        {
          model: User, // pelo model de usuario
          as: 'provider', // como um fornecedor
          attributes: ['id', 'name'], // mostrando os atributos id e nome
          include: [
            // e incluindo
            {
              model: File, // pelo model file
              as: 'avatar', // como avatar
              attributes: ['id', 'path', 'url'], // mostrando os atributos id path e url
            },
          ],
        },
      ],
    });

    return res.status(200).json(appointments); // retorna os agendamentos encontrados
  }

  async store(req, res) {
    const schema = yup.object().shape({
      // cria um modelo pelo yup
      provider_id: yup.number().required(), // id do fornecedor é obrigatorio
      date: yup.date().required(), // data é obrigatória
    });

    if (!(await schema.isValid(req.body))) {
      // se esse esquema for invalido
      return res.status(400).json({ error: 'Validation fails' }); // retorna um erro em json
    }

    const { provider_id, date } = req.body; // desestrutura o id do fornecedor e a data do agendamento

    const checkIsProvider = await User.findOne({
      // verifica se o usuario é um fornecedor
      where: { id: provider_id, provider: true }, // aonde o id é o id de um fornecedor, e se provider é verdadeiro
    });

    if (!checkIsProvider) {
      // se não for um fornecedor
      return res
        .status(401) // retorna um json com erro
        .json({ error: 'You can only create appointments with providers' });
    }

    const hourStart = startOfHour(parseISO(date)); // retorna o inicio de uma hora de uma data especificada
    // e faz um casting da data para Date() do javascript

    if (isBefore(hourStart, new Date())) {
      // se a hora/data informada é anterior a hora/data atual
      return res.status(400).json({ error: 'Past dates are not permitted ' }); // nao permite fazer agendamentos
    }

    const checkAvailability = await Appointment.findOne({
      // Busca os agendamentos
      where: {
        // aonde,
        // o id do usuario é o usuario que esta logado com o token
        provider_id, // e ele é um fornecedor
        canceled_at: null,
        date: hourStart, // e a data informada
      },
    });

    if (checkAvailability) {
      // se ja existe um agendamento nesse horario
      return res
        .status(400) // ele retorna um json com o erro
        .json({ error: 'Appointment date is not available ' });
    }

    const appointment = await Appointment.create({
      // Cria um novo agendamento
      user_id: req.userId, // com o usuario que esta no token
      provider_id, // id do fornecedor
      date, // e data informada
    });

    const user = await User.findByPk(req.userId);

    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.status(200).json(appointment); // retorna o agendamento
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        }
      ]
    });

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({ error: 'You do not have permission to cancel this appointment' });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({ error: 'You can only cancel appointments 2 hours in advance' });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    Queue.add(CancellationMail.key, {
      appointment
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
