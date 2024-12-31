import { describe, it, expect } from "vitest";
import {
  extractNameFromEmail,
  extractEmailAddress,
  extractDomainFromEmail,
  participant,
} from "./email";

describe("email utils", () => {
  describe("extractNameFromEmail", () => {
    it("extracts name from email with format 'Name <email>'", () => {
      expect(extractNameFromEmail("John Doe <john.doe@gmail.com>")).toBe(
        "John Doe",
      );
    });

    it("extracts email from format '<email>'", () => {
      expect(extractNameFromEmail("<john.doe@gmail.com>")).toBe(
        "john.doe@gmail.com",
      );
    });

    it("returns plain email as is", () => {
      expect(extractNameFromEmail("john.doe@gmail.com")).toBe(
        "john.doe@gmail.com",
      );
    });

    it("handles empty input", () => {
      expect(extractNameFromEmail("")).toBe("");
    });
  });

  describe("extractEmailAddress", () => {
    it("extracts email from format 'Name <email>'", () => {
      expect(extractEmailAddress("John Doe <john.doe@gmail.com>")).toBe(
        "john.doe@gmail.com",
      );
    });

    it("returns empty string for invalid format", () => {
      expect(extractEmailAddress("john.doe@gmail.com")).toBe("");
    });
  });

  describe("extractDomainFromEmail", () => {
    it("extracts domain from plain email", () => {
      expect(extractDomainFromEmail("john@example.com")).toBe("example.com");
    });

    it("extracts domain from email with format 'Name <email>'", () => {
      expect(extractDomainFromEmail("John Doe <john@example.com>")).toBe(
        "example.com",
      );
    });

    it("handles subdomains", () => {
      expect(extractDomainFromEmail("john@sub.example.com")).toBe(
        "sub.example.com",
      );
    });

    it("returns empty string for invalid email", () => {
      expect(extractDomainFromEmail("invalid-email")).toBe("");
    });

    it("handles empty input", () => {
      expect(extractDomainFromEmail("")).toBe("");
    });

    it("handles multiple @ symbols", () => {
      expect(extractDomainFromEmail("test@foo@example.com")).toBe("");
    });

    it("handles longer TLDs", () => {
      expect(extractDomainFromEmail("test@example.company")).toBe(
        "example.company",
      );
    });

    it("handles international domains", () => {
      expect(extractDomainFromEmail("user@münchen.de")).toBe("münchen.de");
    });

    it("handles plus addressing", () => {
      expect(extractDomainFromEmail("user+tag@example.com")).toBe(
        "example.com",
      );
    });

    it("handles quoted email addresses", () => {
      expect(extractDomainFromEmail('"John Doe" <john@example.com>')).toBe(
        "example.com",
      );
    });

    it("handles domains with multiple dots", () => {
      expect(extractDomainFromEmail("test@a.b.c.example.com")).toBe(
        "a.b.c.example.com",
      );
    });

    it("handles whitespace in formatted email", () => {
      expect(extractDomainFromEmail("John Doe    <john@example.com>")).toBe(
        "example.com",
      );
    });
  });

  describe("participant", () => {
    const message = {
      headers: {
        from: "sender@example.com",
        to: "recipient@example.com",
      },
    } as const;

    it("returns recipient when user is sender", () => {
      expect(participant(message, "sender@example.com")).toBe(
        "recipient@example.com",
      );
    });

    it("returns sender when user is recipient", () => {
      expect(participant(message, "recipient@example.com")).toBe(
        "sender@example.com",
      );
    });

    it("returns from address when no user email provided", () => {
      expect(participant(message, "")).toBe("sender@example.com");
    });
  });
});
