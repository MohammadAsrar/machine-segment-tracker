const express = require("express");
const router = express.Router();
const machineController = require("../controllers/machine.controller");

// Machine routes
router.get("/", machineController.getAllMachines);
router.get("/:id", machineController.getMachineById);
router.post("/", machineController.createMachine);
router.put("/:id", machineController.updateMachine);
router.delete("/:id", machineController.deleteMachine);

// Segment routes
router.post("/:id/segments", machineController.addSegment);
router.put("/:id/segments/:segmentId", machineController.updateSegment);
router.delete("/:id/segments/:segmentId", machineController.deleteSegment);

module.exports = router;
