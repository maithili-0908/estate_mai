module.exports = {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (_doc, ret) => {
      delete ret._id;
      return ret;
    },
  },
};

