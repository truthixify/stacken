import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("Points Contract Tests", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  describe("Initial State", () => {
    it("should initialize with correct default values", () => {
      const totalPoints = simnet.callReadOnlyFn("points", "get-total-points-issued", [], deployer);
      expect(totalPoints.result).toBeUint(0);

      const multiplier = simnet.callReadOnlyFn("points", "get-global-multiplier", [], deployer);
      expect(multiplier.result).toBeUint(100); // 1.0x

      const isAuthorized = simnet.callReadOnlyFn("points", "is-authorized-issuer", [
        Cl.principal(deployer)
      ], deployer);
      expect(isAuthorized.result).toBeBool(true); // Contract owner is authorized by default
    });

    it("should have predefined achievements", () => {
      const achievement1 = simnet.callReadOnlyFn("points", "get-achievement", [
        Cl.uint(1)
      ], deployer);
      expect(achievement1.result).toBeSome(Cl.tuple({
        "name": Cl.stringAscii("First Steps"),
        "description": Cl.stringAscii("Earn your first points"),
        "points-required": Cl.uint(1)
      }));

      const achievement4 = simnet.callReadOnlyFn("points", "get-achievement", [
        Cl.uint(4)
      ], deployer);
      expect(achievement4.result).toBeSome(Cl.tuple({
        "name": Cl.stringAscii("Super Contributor"),
        "description": Cl.stringAscii("Earn 5000 points"),
        "points-required": Cl.uint(5000)
      }));
    });
  });

  describe("Authorization Management", () => {
    it("should allow owner to add authorized issuer", () => {
      const result = simnet.callPublicFn("points", "add-authorized-issuer", [
        Cl.principal(wallet1)
      ], deployer);
      
      expect(result.result).toBeOk(Cl.bool(true));
      
      const isAuthorized = simnet.callReadOnlyFn("points", "is-authorized-issuer", [
        Cl.principal(wallet1)
      ], deployer);
      expect(isAuthorized.result).toBeBool(true);
    });

    it("should prevent non-owner from adding authorized issuer", () => {
      const result = simnet.callPublicFn("points", "add-authorized-issuer", [
        Cl.principal(wallet2)
      ], wallet1);
      
      expect(result.result).toBeErr(Cl.uint(401)); // ERR_UNAUTHORIZED
    });

    it("should allow owner to remove authorized issuer", () => {
      // First add the issuer
      simnet.callPublicFn("points", "add-authorized-issuer", [
        Cl.principal(wallet1)
      ], deployer);
      
      // Then remove it
      const result = simnet.callPublicFn("points", "remove-authorized-issuer", [
        Cl.principal(wallet1)
      ], deployer);
      
      expect(result.result).toBeOk(Cl.bool(true));
      
      const isAuthorized = simnet.callReadOnlyFn("points", "is-authorized-issuer", [
        Cl.principal(wallet1)
      ], deployer);
      expect(isAuthorized.result).toBeBool(false);
    });
  });

  describe("Points Awarding", () => {
    it("should allow owner to award points", () => {
      const result = simnet.callPublicFn("points", "award-points", [
        Cl.principal(wallet1),
        Cl.uint(100),
        Cl.stringUtf8("Test Reason")
      ], deployer);
      
      expect(result.result).toBeOk(Cl.tuple({
        "points-earned": Cl.uint(100),
        "total-points": Cl.uint(100)
      }));
      
      const userPoints = simnet.callReadOnlyFn("points", "get-user-points", [
        Cl.principal(wallet1)
      ], deployer);
      expect(userPoints.result).toBeUint(100);
    });

    it("should allow authorized issuer to award points", () => {
      // First authorize wallet1
      simnet.callPublicFn("points", "add-authorized-issuer", [
        Cl.principal(wallet1)
      ], deployer);
      
      const result = simnet.callPublicFn("points", "award-points", [
        Cl.principal(wallet2),
        Cl.uint(50),
        Cl.stringUtf8("Authorized Reason")
      ], wallet1);
      
      expect(result.result).toBeOk(Cl.tuple({
        "points-earned": Cl.uint(50),
        "total-points": Cl.uint(50)
      }));
      
      const userPoints = simnet.callReadOnlyFn("points", "get-user-points", [
        Cl.principal(wallet2)
      ], deployer);
      expect(userPoints.result).toBeUint(50);
    });

    it("should prevent unauthorized users from awarding points", () => {
      const result = simnet.callPublicFn("points", "award-points", [
        Cl.principal(wallet2),
        Cl.uint(100),
        Cl.stringUtf8("Unauthorized Reason")
      ], wallet1); // wallet1 is not authorized
      
      expect(result.result).toBeErr(Cl.uint(401)); // ERR_UNAUTHORIZED
    });

    it("should reject zero points", () => {
      const result = simnet.callPublicFn("points", "award-points", [
        Cl.principal(wallet1),
        Cl.uint(0),
        Cl.stringUtf8("Zero Points Reason")
      ], deployer);
      
      expect(result.result).toBeErr(Cl.uint(402)); // ERR_INVALID_AMOUNT
    });

    it("should apply global multiplier correctly", () => {
      // Set multiplier to 1.5x (150)
      simnet.callPublicFn("points", "set-global-multiplier", [
        Cl.uint(150)
      ], deployer);
      
      const result = simnet.callPublicFn("points", "award-points", [
        Cl.principal(wallet1),
        Cl.uint(100),
        Cl.stringUtf8("Multiplied Reason")
      ], deployer);
      
      expect(result.result).toBeOk(Cl.tuple({
        "points-earned": Cl.uint(150), // 100 * 1.5
        "total-points": Cl.uint(150)
      }));
      
      const userPoints = simnet.callReadOnlyFn("points", "get-user-points", [
        Cl.principal(wallet1)
      ], deployer);
      expect(userPoints.result).toBeUint(150);
    });
  });

  describe("Multiplier Management", () => {
    it("should allow owner to set global multiplier", () => {
      const result = simnet.callPublicFn("points", "set-global-multiplier", [
        Cl.uint(200) // 2.0x
      ], deployer);
      
      expect(result.result).toBeOk(Cl.bool(true));
      
      const multiplier = simnet.callReadOnlyFn("points", "get-global-multiplier", [], deployer);
      expect(multiplier.result).toBeUint(200);
    });

    it("should prevent non-owner from setting multiplier", () => {
      const result = simnet.callPublicFn("points", "set-global-multiplier", [
        Cl.uint(200)
      ], wallet1);
      
      expect(result.result).toBeErr(Cl.uint(401)); // ERR_UNAUTHORIZED
    });

    it("should reject invalid multiplier values", () => {
      // Too low (below 0.5x)
      const resultLow = simnet.callPublicFn("points", "set-global-multiplier", [
        Cl.uint(25)
      ], deployer);
      expect(resultLow.result).toBeErr(Cl.uint(406)); // ERR_INVALID_MULTIPLIER
      
      // Too high (above 5.0x)
      const resultHigh = simnet.callPublicFn("points", "set-global-multiplier", [
        Cl.uint(600)
      ], deployer);
      expect(resultHigh.result).toBeErr(Cl.uint(406)); // ERR_INVALID_MULTIPLIER
    });
  });

  describe("Points Tracking", () => {
    beforeEach(() => {
      // Award some points to set up test data
      simnet.callPublicFn("points", "award-points", [
        Cl.principal(wallet1),
        Cl.uint(100),
        Cl.stringUtf8("First Reason")
      ], deployer);
      
      simnet.callPublicFn("points", "award-points", [
        Cl.principal(wallet1),
        Cl.uint(200),
        Cl.stringUtf8("Second Reason")
      ], deployer);
    });

    it("should return correct total points issued", () => {
      const totalPoints = simnet.callReadOnlyFn("points", "get-total-points-issued", [], deployer);
      expect(totalPoints.result).toBeUint(300); // 100 + 200
    });
  });

  describe("User Queries", () => {
    it("should return zero points for new user", () => {
      const userPoints = simnet.callReadOnlyFn("points", "get-user-points", [
        Cl.principal(wallet3)
      ], deployer);
      expect(userPoints.result).toBeUint(0);
    });

    it("should return empty achievements for new user", () => {
      const achievements = simnet.callReadOnlyFn("points", "get-user-achievements", [
        Cl.principal(wallet3)
      ], deployer);
      expect(achievements.result).toBeList([]);
    });
  });

  describe("Achievement System", () => {
    it("should return none for non-existent achievement", () => {
      const achievement = simnet.callReadOnlyFn("points", "get-achievement", [
        Cl.uint(999)
      ], deployer);
      expect(achievement.result).toBeNone();
    });

    it("should award First Steps achievement automatically", () => {
      // Award first points to trigger achievement
      simnet.callPublicFn("points", "award-points", [
        Cl.principal(wallet1),
        Cl.uint(10),
        Cl.stringUtf8("First Reason")
      ], deployer);
      
      const achievements = simnet.callReadOnlyFn("points", "get-user-achievements", [
        Cl.principal(wallet1)
      ], deployer);
      
      // Should include achievement ID 1 (First Steps)
      expect(achievements.result).toBeList([Cl.uint(1)]);
    });

    it("should award Point Master achievement for 1000+ points", () => {
      // Award 1000 points to trigger achievement
      simnet.callPublicFn("points", "award-points", [
        Cl.principal(wallet1),
        Cl.uint(1000),
        Cl.stringUtf8("Big Reason")
      ], deployer);
      
      const achievements = simnet.callReadOnlyFn("points", "get-user-achievements", [
        Cl.principal(wallet1)
      ], deployer);
      
      // Should include achievement IDs 1 (First Steps), 2 (Community Star), and 3 (Point Master)
      expect(achievements.result).toBeList([Cl.uint(1), Cl.uint(2), Cl.uint(3)]);
    });
  });
});