const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance", "decommissioned"],
      default: "active",
    },
    segments: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        status: {
          type: String,
          enum: ["operational", "faulty", "maintenance"],
          default: "operational",
        },
        lastMaintenance: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    location: {
      type: String,
      trim: true,
    },
    installationDate: {
      type: Date,
      default: Date.now,
    },
    lastServiceDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Machine = mongoose.model("Machine", machineSchema);

module.exports = Machine;
