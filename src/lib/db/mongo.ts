import mongoose, { Schema, model, models } from 'mongoose'

declare global {
  var mongoConn: typeof mongoose | undefined
}

export async function connectMongo() {
  if (global.mongoConn) return global.mongoConn

  const conn = await mongoose.connect(process.env.MONGO_URL!, {
    bufferCommands: false,
  })

  if (process.env.NODE_ENV !== 'production') {
    global.mongoConn = conn
  }

  return conn
}

// ─── Publication Schema ──────────────────────────────────────
const PublicationSchema = new Schema(
  {
    title:     { type: String, required: true, trim: true },
    authors:   { type: [String], required: true },
    abstract:  { type: String, required: true },
    journal:   { type: String },
    conference:{ type: String },
    year:      { type: Number, required: true },
    doi:       { type: String, unique: true, sparse: true },
    tags:      { type: [String], default: [] },
    pdfUrl:    { type: String },
    createdBy: { type: String, required: true }, // user UUID from Postgres
  },
  { timestamps: true }
)

PublicationSchema.index({ year: -1 })
PublicationSchema.index({ tags: 1 })
PublicationSchema.index({ title: 'text', abstract: 'text' })

export const Publication =
  models.Publication || model('Publication', PublicationSchema)
