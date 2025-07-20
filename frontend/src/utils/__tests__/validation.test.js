import {
  isValidTimeFormat,
  isEndTimeAfterStartTime,
  hasOverlappingSegments,
  isFutureDate,
  isRequired,
  isValidMachineName,
  isValidSegmentType,
  isDateInRange,
  validateSegmentForm,
  formatTimeString,
  formatDateString,
  formatDuration,
} from "../validation";

describe("Time Validation Functions", () => {
  describe("isValidTimeFormat", () => {
    it("should return true for valid HH:mm:ss time format", () => {
      expect(isValidTimeFormat("12:30:45")).toBe(true);
      expect(isValidTimeFormat("00:00:00")).toBe(true);
      expect(isValidTimeFormat("23:59:59")).toBe(true);
    });

    it("should return false for invalid time formats", () => {
      expect(isValidTimeFormat("")).toBe(false);
      expect(isValidTimeFormat(null)).toBe(false);
      expect(isValidTimeFormat(undefined)).toBe(false);
      expect(isValidTimeFormat("12:30")).toBe(false);
      expect(isValidTimeFormat("25:00:00")).toBe(false);
      expect(isValidTimeFormat("12:60:00")).toBe(false);
      expect(isValidTimeFormat("12:30:60")).toBe(false);
      expect(isValidTimeFormat("12-30-45")).toBe(false);
      expect(isValidTimeFormat("12.30.45")).toBe(false);
    });
  });

  describe("isEndTimeAfterStartTime", () => {
    it("should return true when end time is after start time", () => {
      expect(isEndTimeAfterStartTime("08:00:00", "09:00:00")).toBe(true);
      expect(isEndTimeAfterStartTime("23:59:58", "23:59:59")).toBe(true);
    });

    it("should return false when end time is equal to or before start time", () => {
      expect(isEndTimeAfterStartTime("09:00:00", "08:00:00")).toBe(false);
      expect(isEndTimeAfterStartTime("09:00:00", "09:00:00")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isEndTimeAfterStartTime("", "09:00:00")).toBe(true);
      expect(isEndTimeAfterStartTime("09:00:00", "")).toBe(true);
      expect(isEndTimeAfterStartTime("", "")).toBe(true);
      expect(isEndTimeAfterStartTime("invalid", "09:00:00")).toBe(false);
      expect(isEndTimeAfterStartTime("09:00:00", "invalid")).toBe(false);
    });
  });

  describe("hasOverlappingSegments", () => {
    const existingSegments = [
      {
        id: "1",
        date: "2023-01-01",
        startTime: "08:00:00",
        endTime: "10:00:00",
        machineName: "M1",
      },
      {
        id: "2",
        date: "2023-01-01",
        startTime: "12:00:00",
        endTime: "14:00:00",
        machineName: "M1",
      },
      {
        id: "3",
        date: "2023-01-01",
        startTime: "09:00:00",
        endTime: "11:00:00",
        machineName: "M2",
      },
    ];

    it("should detect overlapping segments for the same machine and date", () => {
      // New segment starts during an existing segment
      expect(
        hasOverlappingSegments(
          {
            date: "2023-01-01",
            startTime: "09:00:00",
            endTime: "11:00:00",
            machineName: "M1",
          },
          existingSegments
        )
      ).toBe(true);

      // New segment ends during an existing segment
      expect(
        hasOverlappingSegments(
          {
            date: "2023-01-01",
            startTime: "07:00:00",
            endTime: "09:00:00",
            machineName: "M1",
          },
          existingSegments
        )
      ).toBe(true);

      // New segment completely contains an existing segment
      expect(
        hasOverlappingSegments(
          {
            date: "2023-01-01",
            startTime: "07:00:00",
            endTime: "15:00:00",
            machineName: "M1",
          },
          existingSegments
        )
      ).toBe(true);
    });

    it("should not detect overlaps for different machines or dates", () => {
      // Same time but different machine
      expect(
        hasOverlappingSegments(
          {
            date: "2023-01-01",
            startTime: "08:00:00",
            endTime: "10:00:00",
            machineName: "M3",
          },
          existingSegments
        )
      ).toBe(false);

      // Same machine but different date
      expect(
        hasOverlappingSegments(
          {
            date: "2023-01-02",
            startTime: "08:00:00",
            endTime: "10:00:00",
            machineName: "M1",
          },
          existingSegments
        )
      ).toBe(false);
    });

    it("should not detect overlap with itself when updating", () => {
      expect(
        hasOverlappingSegments(
          {
            id: "1",
            date: "2023-01-01",
            startTime: "08:00:00",
            endTime: "10:00:00",
            machineName: "M1",
          },
          existingSegments
        )
      ).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(hasOverlappingSegments(null, existingSegments)).toBe(false);
      expect(hasOverlappingSegments({}, existingSegments)).toBe(false);
      expect(
        hasOverlappingSegments(
          {
            date: "2023-01-01",
            startTime: "08:00:00",
            endTime: "10:00:00",
            machineName: "M1",
          },
          null
        )
      ).toBe(false);
      expect(
        hasOverlappingSegments(
          {
            date: "2023-01-01",
            startTime: "08:00:00",
            endTime: "10:00:00",
            machineName: "M1",
          },
          []
        )
      ).toBe(false);
    });
  });

  describe("isFutureDate", () => {
    const realDate = Date;
    const mockDate = new Date("2023-01-15T12:00:00Z");

    beforeAll(() => {
      global.Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            return mockDate;
          }
          return new realDate(...args);
        }
      };
    });

    afterAll(() => {
      global.Date = realDate;
    });

    it("should return true for future dates", () => {
      expect(isFutureDate("2023-01-16")).toBe(true);
      expect(isFutureDate("2023-02-15")).toBe(true);
      expect(isFutureDate("2024-01-15")).toBe(true);
    });

    it("should return true for today", () => {
      expect(isFutureDate("2023-01-15")).toBe(true);
    });

    it("should return false for past dates", () => {
      expect(isFutureDate("2023-01-14")).toBe(false);
      expect(isFutureDate("2022-12-15")).toBe(false);
      expect(isFutureDate("2022-01-15")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isFutureDate("")).toBe(false);
      expect(isFutureDate(null)).toBe(false);
      expect(isFutureDate(undefined)).toBe(false);
      expect(isFutureDate("invalid-date")).toBe(false);
    });
  });
});

describe("Data Validation Functions", () => {
  describe("isRequired", () => {
    it("should return true for non-empty values", () => {
      expect(isRequired("text")).toBe(true);
      expect(isRequired(0)).toBe(true);
      expect(isRequired(false)).toBe(true);
      expect(isRequired([])).toBe(true);
      expect(isRequired({})).toBe(true);
    });

    it("should return false for empty values", () => {
      expect(isRequired("")).toBe(false);
      expect(isRequired("   ")).toBe(false);
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
    });
  });

  describe("isValidMachineName", () => {
    it("should return true for valid machine names", () => {
      expect(isValidMachineName("M1")).toBe(true);
      expect(isValidMachineName("Machine123")).toBe(true);
      expect(isValidMachineName("machine_name")).toBe(true);
      expect(isValidMachineName("machine-name")).toBe(true);
    });

    it("should return false for invalid machine names", () => {
      expect(isValidMachineName("")).toBe(false);
      expect(isValidMachineName(null)).toBe(false);
      expect(isValidMachineName(undefined)).toBe(false);
      expect(isValidMachineName("Machine Name")).toBe(false); // Contains space
      expect(isValidMachineName("Machine@123")).toBe(false); // Contains special character
    });
  });

  describe("isValidSegmentType", () => {
    it("should return true for valid segment types", () => {
      expect(isValidSegmentType("Uptime")).toBe(true);
      expect(isValidSegmentType("Downtime")).toBe(true);
      expect(isValidSegmentType("Idle")).toBe(true);
    });

    it("should return false for invalid segment types", () => {
      expect(isValidSegmentType("")).toBe(false);
      expect(isValidSegmentType(null)).toBe(false);
      expect(isValidSegmentType(undefined)).toBe(false);
      expect(isValidSegmentType("Unknown")).toBe(false);
      expect(isValidSegmentType("uptime")).toBe(false); // Case sensitive
    });
  });

  describe("isDateInRange", () => {
    const realDate = Date;
    const mockDate = new Date("2023-01-15T12:00:00Z");

    beforeAll(() => {
      global.Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            return mockDate;
          }
          return new realDate(...args);
        }
      };
    });

    afterAll(() => {
      global.Date = realDate;
    });

    it("should return true for dates within the default range (30 days)", () => {
      expect(isDateInRange("2023-01-15")).toBe(true); // Today
      expect(isDateInRange("2023-01-01")).toBe(true); // 14 days ago
      expect(isDateInRange("2023-02-14")).toBe(true); // 30 days ahead
    });

    it("should return false for dates outside the default range", () => {
      expect(isDateInRange("2022-12-15")).toBe(false); // 31 days ago
      expect(isDateInRange("2023-02-15")).toBe(false); // 31 days ahead
    });

    it("should respect custom range parameter", () => {
      expect(isDateInRange("2023-01-10", 5)).toBe(true); // 5 days ago
      expect(isDateInRange("2023-01-05", 5)).toBe(false); // 10 days ago
      expect(isDateInRange("2023-02-15", 60)).toBe(true); // 31 days ahead, but within 60 days
    });

    it("should handle edge cases", () => {
      expect(isDateInRange("")).toBe(false);
      expect(isDateInRange(null)).toBe(false);
      expect(isDateInRange(undefined)).toBe(false);
      expect(isDateInRange("invalid-date")).toBe(false);
    });
  });
});

describe("Form Validation", () => {
  describe("validateSegmentForm", () => {
    const existingSegments = [
      {
        id: "1",
        date: "2023-01-01",
        startTime: "08:00:00",
        endTime: "10:00:00",
        machineName: "M1",
        segmentType: "Uptime",
      },
    ];

    it("should validate a valid form", () => {
      const formData = {
        date: "2023-01-02",
        startTime: "08:00:00",
        endTime: "10:00:00",
        machineName: "M1",
        segmentType: "Uptime",
      };

      const result = validateSegmentForm(formData, existingSegments);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should detect missing required fields", () => {
      const formData = {
        date: "",
        startTime: "",
        endTime: "10:00:00",
        machineName: "M1",
        segmentType: "Uptime",
      };

      const result = validateSegmentForm(formData, existingSegments);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty("date");
      expect(result.errors).toHaveProperty("startTime");
    });

    it("should detect invalid time formats", () => {
      const formData = {
        date: "2023-01-02",
        startTime: "8:00", // Missing seconds
        endTime: "10:00:00",
        machineName: "M1",
        segmentType: "Uptime",
      };

      const result = validateSegmentForm(formData, existingSegments);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty("startTime");
    });

    it("should detect end time before start time", () => {
      const formData = {
        date: "2023-01-02",
        startTime: "10:00:00",
        endTime: "08:00:00", // Before start time
        machineName: "M1",
        segmentType: "Uptime",
      };

      const result = validateSegmentForm(formData, existingSegments);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty("endTime");
    });

    it("should detect overlapping segments", () => {
      const formData = {
        date: "2023-01-01",
        startTime: "09:00:00", // Overlaps with existing segment
        endTime: "11:00:00",
        machineName: "M1",
        segmentType: "Uptime",
      };

      const result = validateSegmentForm(formData, existingSegments);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty("general");
    });

    it("should detect invalid machine name format", () => {
      const formData = {
        date: "2023-01-02",
        startTime: "08:00:00",
        endTime: "10:00:00",
        machineName: "Machine Name", // Contains space
        segmentType: "Uptime",
      };

      const result = validateSegmentForm(formData, existingSegments);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty("machineName");
    });

    it("should detect invalid segment type", () => {
      const formData = {
        date: "2023-01-02",
        startTime: "08:00:00",
        endTime: "10:00:00",
        machineName: "M1",
        segmentType: "Unknown", // Invalid segment type
      };

      const result = validateSegmentForm(formData, existingSegments);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty("segmentType");
    });
  });
});

describe("Helper Functions", () => {
  describe("formatTimeString", () => {
    it("should format time string correctly", () => {
      expect(formatTimeString("08:30")).toBe("08:30:00");
      expect(formatTimeString("8:30")).toBe("08:30:00");
      expect(formatTimeString("08:30:45")).toBe("08:30:45");

      const date = new Date();
      date.setHours(8, 30, 45);
      expect(formatTimeString(date)).toBe("08:30:45");
    });

    it("should handle edge cases", () => {
      expect(formatTimeString("")).toBe("");
      expect(formatTimeString(null)).toBe("");
      expect(formatTimeString(undefined)).toBe("");
      expect(formatTimeString("invalid")).toBe("");
    });
  });

  describe("formatDateString", () => {
    it("should format date string correctly", () => {
      expect(formatDateString("2023-01-15")).toBe("2023-01-15");
      expect(formatDateString("01/15/2023")).toBe("2023-01-15");

      const date = new Date("2023-01-15");
      expect(formatDateString(date)).toBe("2023-01-15");
    });

    it("should handle edge cases", () => {
      expect(formatDateString("")).toBe("");
      expect(formatDateString(null)).toBe("");
      expect(formatDateString(undefined)).toBe("");
      expect(formatDateString("invalid")).toBe("");
    });
  });

  describe("formatDuration", () => {
    it("should format duration correctly", () => {
      expect(formatDuration(30)).toBe("30m");
      expect(formatDuration(60)).toBe("1h");
      expect(formatDuration(90)).toBe("1h 30m");
      expect(formatDuration(120)).toBe("2h");
      expect(formatDuration(150)).toBe("2h 30m");
    });

    it("should handle edge cases", () => {
      expect(formatDuration(0)).toBe("0m");
      expect(formatDuration("")).toBe("");
      expect(formatDuration(null)).toBe("");
      expect(formatDuration(undefined)).toBe("");
    });
  });
});
