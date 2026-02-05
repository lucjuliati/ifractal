import mongoose from 'mongoose'
const { Schema } = mongoose

const dataSchema = new Schema({
  user: String,
  date: Date,
  key: String,
  total: String,
  lunch: String,
  points: [String]
})

export const Data = mongoose.model('Data', dataSchema)
