const { startOfDay, endOfDay, parseISO } = require('date-fns');
const { Op } = require('sequelize');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

class ScheduleController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkUserProvider) {
      return res.status(401).json({ error: 'Usuario não é um fornecedor' });
    }

    const { date } = req.query;
    const parsedDate = parseISO(date);

    const appointments = await Appointment.findOne({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: { [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)] },
      },
      order: ['date'],
    });

    return res.json(appointments);
  }
}

module.exports = new ScheduleController();
