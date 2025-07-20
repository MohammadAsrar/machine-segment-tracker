const Machine = require('../models/Machine');

// Get all machines
exports.getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.find();
    res.status(200).json(machines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single machine
exports.getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    res.status(200).json(machine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new machine
exports.createMachine = async (req, res) => {
  try {
    const machine = new Machine(req.body);
    const newMachine = await machine.save();
    res.status(201).json(newMachine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a machine
exports.updateMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    Object.assign(machine, req.body);
    const updatedMachine = await machine.save();
    res.status(200).json(updatedMachine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a machine
exports.deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    await Machine.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Machine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a segment to a machine
exports.addSegment = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    machine.segments.push(req.body);
    const updatedMachine = await machine.save();
    res.status(200).json(updatedMachine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a segment
exports.updateSegment = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    const segment = machine.segments.id(req.params.segmentId);
    if (!segment) {
      return res.status(404).json({ message: 'Segment not found' });
    }

    Object.assign(segment, req.body);
    const updatedMachine = await machine.save();
    res.status(200).json(updatedMachine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a segment
exports.deleteSegment = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    const segmentIndex = machine.segments.findIndex(
      (segment) => segment._id.toString() === req.params.segmentId
    );

    if (segmentIndex === -1) {
      return res.status(404).json({ message: 'Segment not found' });
    }

    machine.segments.splice(segmentIndex, 1);
    const updatedMachine = await machine.save();
    res.status(200).json(updatedMachine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
