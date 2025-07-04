// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TransportContract is ERC721, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId = 1;
    
    enum ShipmentStatus { Draft, Active, InTransit, Delivered, Delayed, Cancelled }
    
    struct Shipment {
        string shipmentNumber;
        address customer;
        address carrier;
        string originAddress;
        string destinationAddress;
        string description;
        uint256 valueUSD;
        uint256 expectedDelivery;
        uint256 penaltyPerDay;
        ShipmentStatus status;
        uint256 progress;
        uint256 escrowAmount;
        bool isCompleted;
        uint256 createdAt;
    }
    
    struct TrackingEvent {
        string eventType;
        string description;
        string location;
        uint256 timestamp;
        address recordedBy;
    }
    
    struct CustodyRecord {
        address holder;
        string holderName;
        string action;
        string location;
        uint256 timestamp;
        bool isVerified;
    }
    
    mapping(uint256 => Shipment) public shipments;
    mapping(uint256 => TrackingEvent[]) public trackingEvents;
    mapping(uint256 => CustodyRecord[]) public custodyChain;
    mapping(address => bool) public verifiedCarriers;
    mapping(string => uint256) public shipmentNumberToTokenId;
    
    event ShipmentCreated(uint256 indexed tokenId, string shipmentNumber, address customer, address carrier);
    event StatusUpdated(uint256 indexed tokenId, ShipmentStatus newStatus, uint256 progress);
    event TrackingEventAdded(uint256 indexed tokenId, string eventType, string location);
    event CustodyTransferred(uint256 indexed tokenId, address from, address to, string action);
    event ShipmentCompleted(uint256 indexed tokenId, bool onTime);
    event EscrowReleased(uint256 indexed tokenId, address recipient, uint256 amount);
    
    modifier onlyCustomerOrCarrier(uint256 tokenId) {
        require(
            shipments[tokenId].customer == msg.sender || 
            shipments[tokenId].carrier == msg.sender,
            "Not authorized"
        );
        _;
    }
    
    modifier onlyCarrier(uint256 tokenId) {
        require(shipments[tokenId].carrier == msg.sender, "Only carrier can perform this action");
        _;
    }
    
    modifier shipmentExists(uint256 tokenId) {
        require(shipments[tokenId].customer != address(0), "Shipment does not exist");
        _;
    }
    
    constructor() ERC721("TransportNFT", "TNFT") {}
    
    function createShipment(
        string memory _shipmentNumber,
        address _carrier,
        string memory _originAddress,
        string memory _destinationAddress,
        string memory _description,
        uint256 _valueUSD,
        uint256 _expectedDelivery,
        uint256 _penaltyPerDay
    ) external payable returns (uint256) {
        require(bytes(_shipmentNumber).length > 0, "Shipment number required");
        require(_carrier != address(0), "Carrier address required");
        require(msg.value > 0, "Escrow amount required");
        
        uint256 tokenId = _nextTokenId++;
        
        shipments[tokenId] = Shipment({
            shipmentNumber: _shipmentNumber,
            customer: msg.sender,
            carrier: _carrier,
            originAddress: _originAddress,
            destinationAddress: _destinationAddress,
            description: _description,
            valueUSD: _valueUSD,
            expectedDelivery: _expectedDelivery,
            penaltyPerDay: _penaltyPerDay,
            status: ShipmentStatus.Draft,
            progress: 0,
            escrowAmount: msg.value,
            isCompleted: false,
            createdAt: block.timestamp
        });
        
        shipmentNumberToTokenId[_shipmentNumber] = tokenId;
        
        // Mint NFT to customer
        _safeMint(msg.sender, tokenId);
        
        // Add initial custody record
        custodyChain[tokenId].push(CustodyRecord({
            holder: msg.sender,
            holderName: "Customer",
            action: "created",
            location: _originAddress,
            timestamp: block.timestamp,
            isVerified: true
        }));
        
        // Add initial tracking event
        trackingEvents[tokenId].push(TrackingEvent({
            eventType: "shipment_created",
            description: "Shipment created and smart contract initialized",
            location: _originAddress,
            timestamp: block.timestamp,
            recordedBy: msg.sender
        }));
        
        emit ShipmentCreated(tokenId, _shipmentNumber, msg.sender, _carrier);
        
        return tokenId;
    }
    
    function updateShipmentStatus(
        uint256 tokenId,
        ShipmentStatus _status,
        uint256 _progress
    ) external onlyCarrier(tokenId) shipmentExists(tokenId) {
        require(_progress <= 100, "Progress cannot exceed 100%");
        require(!shipments[tokenId].isCompleted, "Shipment already completed");
        
        shipments[tokenId].status = _status;
        shipments[tokenId].progress = _progress;
        
        emit StatusUpdated(tokenId, _status, _progress);
        
        // Auto-complete if delivered
        if (_status == ShipmentStatus.Delivered) {
            completeShipment(tokenId);
        }
    }
    
    function addTrackingEvent(
        uint256 tokenId,
        string memory _eventType,
        string memory _description,
        string memory _location
    ) external onlyCarrier(tokenId) shipmentExists(tokenId) {
        trackingEvents[tokenId].push(TrackingEvent({
            eventType: _eventType,
            description: _description,
            location: _location,
            timestamp: block.timestamp,
            recordedBy: msg.sender
        }));
        
        emit TrackingEventAdded(tokenId, _eventType, _location);
    }
    
    function transferCustody(
        uint256 tokenId,
        address _newHolder,
        string memory _holderName,
        string memory _action,
        string memory _location
    ) external onlyCarrier(tokenId) shipmentExists(tokenId) {
        custodyChain[tokenId].push(CustodyRecord({
            holder: _newHolder,
            holderName: _holderName,
            action: _action,
            location: _location,
            timestamp: block.timestamp,
            isVerified: true
        }));
        
        emit CustodyTransferred(tokenId, msg.sender, _newHolder, _action);
    }
    
    function completeShipment(uint256 tokenId) public onlyCarrier(tokenId) shipmentExists(tokenId) {
        require(!shipments[tokenId].isCompleted, "Shipment already completed");
        
        Shipment storage shipment = shipments[tokenId];
        shipment.isCompleted = true;
        shipment.status = ShipmentStatus.Delivered;
        
        bool onTime = block.timestamp <= shipment.expectedDelivery;
        uint256 releaseAmount = shipment.escrowAmount;
        
        // Calculate penalty if late
        if (!onTime && shipment.penaltyPerDay > 0) {
            uint256 daysLate = (block.timestamp - shipment.expectedDelivery) / 1 days;
            uint256 penalty = daysLate * shipment.penaltyPerDay;
            
            if (penalty < releaseAmount) {
                releaseAmount -= penalty;
                // Send penalty to customer
                payable(shipment.customer).transfer(penalty);
            } else {
                releaseAmount = 0;
            }
        }
        
        // Release remaining escrow to carrier
        if (releaseAmount > 0) {
            payable(shipment.carrier).transfer(releaseAmount);
        }
        
        emit ShipmentCompleted(tokenId, onTime);
        emit EscrowReleased(tokenId, shipment.carrier, releaseAmount);
    }
    
    function getShipment(uint256 tokenId) external view returns (Shipment memory) {
        return shipments[tokenId];
    }
    
    function getTrackingEvents(uint256 tokenId) external view returns (TrackingEvent[] memory) {
        return trackingEvents[tokenId];
    }
    
    function getCustodyChain(uint256 tokenId) external view returns (CustodyRecord[] memory) {
        return custodyChain[tokenId];
    }
    
    function getTokenIdByShipmentNumber(string memory _shipmentNumber) external view returns (uint256) {
        return shipmentNumberToTokenId[_shipmentNumber];
    }
    
    function verifyCarrier(address _carrier) external onlyOwner {
        verifiedCarriers[_carrier] = true;
    }
    
    function revokeCarrier(address _carrier) external onlyOwner {
        verifiedCarriers[_carrier] = false;
    }
    
    // Emergency function to release escrow in case of disputes
    function emergencyRelease(uint256 tokenId, address recipient) external onlyOwner shipmentExists(tokenId) {
        require(!shipments[tokenId].isCompleted, "Shipment already completed");
        
        uint256 amount = shipments[tokenId].escrowAmount;
        shipments[tokenId].escrowAmount = 0;
        shipments[tokenId].isCompleted = true;
        
        payable(recipient).transfer(amount);
        emit EscrowReleased(tokenId, recipient, amount);
    }
    
    // Override transfer functions to make NFTs non-transferable except by contract
    function transferFrom(address from, address to, uint256 tokenId) public override {
        revert("NFTs are non-transferable");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        revert("NFTs are non-transferable");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        revert("NFTs are non-transferable");
    }
}