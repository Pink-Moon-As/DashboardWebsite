const Joi =  require('joi')
.extend(require('@joi/date'));
const moment = require('moment');
const sendOtpSchema = Joi.object({
  phone_num: Joi.string()
    .regex(/^\+[0-9]{10,13}$/) // Regex to match + followed by 10 to 13 digits
    .required(),
  login_flag: Joi.boolean().required(), // Add login_flag as a required boolean field
});

const verifyOtpSchema = Joi.object({
  phone_num: Joi.string()
    .regex(/^\+[0-9]{10,13}$/) // Regex to match + followed by 10 to 13 digits
    .required(),
  code: Joi.string()
  .regex(/^[0-9]{6}$/) // Regex to match a 6-digit number
  .required(),
});

const addChantingDataSchema = Joi.object({
  date: Joi.date()
    .format('YYYY-MM-DD')
    .max('now')
    .required(),
  count: Joi.number()
    .integer()
    .min(1)
    .required(),
  mantra_id: Joi.string()
    .trim()
    .required()
});


module.exports = {
  sendOtpSchema,
  verifyOtpSchema,
  addChantingDataSchema
}