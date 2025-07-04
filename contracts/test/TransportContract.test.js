const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TransportContract", function () {
  let transportContract;
  let owner, customer, carrier, otherAccount;

  beforeEach(async function () {
    [owner, customer, carrier, otherAccount] = await ethers.getSigners();
    
    const TransportContract = await ethers.getContractFactory("TransportContract");
    transportContract = await TransportContract.deploy();
    await transportContract.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await transportContract.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await transportContract.name()).to.equal("TransportNFT");
      expect(await transportContract.symbol()).to.equal("TNFT");
    });
  });

  describe("Shipment Creation", function () {
    it("Should create a shipment and mint NFT", async function () {
      const shipmentNumber = "SP-2024-001";
      const expectedDelivery = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now
      const escrowAmount = ethers.utils.parseEther("1.0");

      await expect(
        transportContract.connect(customer).createShipment(
          shipmentNumber,
          carrier.address,
          "New York, NY",
          "Los Angeles, CA",
          "Electronics shipment",
          50000, // $50,000 USD value
          expectedDelivery,
          100, // $100 per day penalty
          { value: escrowAmount }
        )
      ).to.emit(transportContract, "ShipmentCreated");

      // Check NFT was minted to customer
      expect(await transportContract.ownerOf(1)).to.equal(customer.address);
      
      // Check shipment details
      const shipment = await transportContract.getShipment(1);
      expect(shipment.shipmentNumber).to.equal(shipmentNumber);
      expect(shipment.customer).to.equal(customer.address);
      expect(shipment.carrier).to.equal(carrier.address);
      expect(shipment.escrowAmount).to.equal(escrowAmount);
    });

    it("Should fail without escrow amount", async function () {
      await expect(
        transportContract.connect(customer).createShipment(
          "SP-2024-002",
          carrier.address,
          "Origin",
          "Destination",
          "Test shipment",
          1000,
          Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
          50
        )
      ).to.be.revertedWith("Escrow amount required");
    });
  });

  describe("Status Updates", function () {
    let tokenId;

    beforeEach(async function () {
      // Create a shipment first
      const escrowAmount = ethers.utils.parseEther("1.0");
      await transportContract.connect(customer).createShipment(
        "SP-2024-003",
        carrier.address,
        "Origin",
        "Destination",
        "Test shipment",
        1000,
        Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        50,
        { value: escrowAmount }
      );
      tokenId = 1;
    });

    it("Should allow carrier to update status", async function () {
      await expect(
        transportContract.connect(carrier).updateShipmentStatus(tokenId, 2, 50) // InTransit, 50%
      ).to.emit(transportContract, "StatusUpdated");

      const shipment = await transportContract.getShipment(tokenId);
      expect(shipment.status).to.equal(2); // InTransit
      expect(shipment.progress).to.equal(50);
    });

    it("Should not allow non-carrier to update status", async function () {
      await expect(
        transportContract.connect(otherAccount).updateShipmentStatus(tokenId, 2, 50)
      ).to.be.revertedWith("Only carrier can perform this action");
    });
  });

  describe("Tracking Events", function () {
    let tokenId;

    beforeEach(async function () {
      const escrowAmount = ethers.utils.parseEther("1.0");
      await transportContract.connect(customer).createShipment(
        "SP-2024-004",
        carrier.address,
        "Origin",
        "Destination",
        "Test shipment",
        1000,
        Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        50,
        { value: escrowAmount }
      );
      tokenId = 1;
    });

    it("Should allow carrier to add tracking events", async function () {
      await expect(
        transportContract.connect(carrier).addTrackingEvent(
          tokenId,
          "picked_up",
          "Package picked up from origin",
          "New York, NY"
        )
      ).to.emit(transportContract, "TrackingEventAdded");

      const events = await transportContract.getTrackingEvents(tokenId);
      expect(events.length).to.equal(2); // Initial event + new event
      expect(events[1].eventType).to.equal("picked_up");
    });
  });

  describe("Completion and Escrow Release", function () {
    let tokenId;
    const escrowAmount = ethers.utils.parseEther("1.0");

    beforeEach(async function () {
      await transportContract.connect(customer).createShipment(
        "SP-2024-005",
        carrier.address,
        "Origin",
        "Destination",
        "Test shipment",
        1000,
        Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days future
        ethers.utils.parseEther("0.1"), // 0.1 ETH per day penalty
        { value: escrowAmount }
      );
      tokenId = 1;
    });

    it("Should complete shipment and release full escrow when on time", async function () {
      const initialCarrierBalance = await ethers.provider.getBalance(carrier.address);
      
      await expect(
        transportContract.connect(carrier).completeShipment(tokenId)
      ).to.emit(transportContract, "ShipmentCompleted")
       .and.to.emit(transportContract, "EscrowReleased");

      const shipment = await transportContract.getShipment(tokenId);
      expect(shipment.isCompleted).to.be.true;
      expect(shipment.status).to.equal(3); // Delivered

      // Check carrier received escrow (minus gas fees)
      const finalCarrierBalance = await ethers.provider.getBalance(carrier.address);
      expect(finalCarrierBalance.sub(initialCarrierBalance)).to.be.closeTo(
        escrowAmount,
        ethers.utils.parseEther("0.01") // Allow for gas fees
      );
    });

    it("Should prevent double completion", async function () {
      await transportContract.connect(carrier).completeShipment(tokenId);
      
      await expect(
        transportContract.connect(carrier).completeShipment(tokenId)
      ).to.be.revertedWith("Shipment already completed");
    });
  });

  describe("Carrier Verification", function () {
    it("Should allow owner to verify carriers", async function () {
      await transportContract.verifyCarrier(carrier.address);
      expect(await transportContract.verifiedCarriers(carrier.address)).to.be.true;
    });

    it("Should allow owner to revoke carrier verification", async function () {
      await transportContract.verifyCarrier(carrier.address);
      await transportContract.revokeCarrier(carrier.address);
      expect(await transportContract.verifiedCarriers(carrier.address)).to.be.false;
    });
  });
});