const yup = require('yup');
const User = require('../models/User');

class UserController {
  async store(req, res) {
    const schema = yup.object().shape({
      name: yup.string().required(),
      email: yup
        .string()
        .email()
        .required(),
      password: yup
        .string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExist = await User.findOne({ where: { email: req.body.email } });

    if (userExist) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    console.log(req.userId);

    const schema = yup.object().shape({
      name: yup.string(),
      email: yup.string().email(),
      oldPassword: yup.string().min(6),
      password: yup
        .string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),

      confirmPassword: yup
        .string()
        .when('password', (password, field) =>
          password ? field.required().oneOf([yup.ref('password')]) : field
        ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExist = await User.findOne({
        where: { email },
      });

      if (userExist) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Old Password incorrect' });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

module.exports = new UserController();
