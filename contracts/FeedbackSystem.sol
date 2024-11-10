// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FeedbackSystem {
    struct Form {
        uint256 id;
        address creator;
        string formCID;  // IPFS CID for form structure
        bool isActive;
        uint256 createdAt;
    }
    
    struct Response {
        address respondent;
        string responseCID;  // IPFS CID for response data
        uint256 timestamp;
    }
    
    mapping(address => bool) public admins;
    mapping(uint256 => Form) public forms;
    mapping(uint256 => Response[]) public formResponses;
    uint256 public formCount;
    
    event FormCreated(uint256 indexed formId, address creator, string formCID);
    event ResponseSubmitted(uint256 indexed formId, address respondent, string responseCID);
    event FormDeactivated(uint256 indexed formId);
    
    constructor() {
        admins[msg.sender] = true;
    }
    
    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin can perform this action");
        _;
    }
    
    function addAdmin(address _admin) public onlyAdmin {
        admins[_admin] = true;
    }
    
    function createForm(string memory _formCID) public onlyAdmin {
        formCount++;
        forms[formCount] = Form(
            formCount,
            msg.sender,
            _formCID,
            true,
            block.timestamp
        );
        
        emit FormCreated(formCount, msg.sender, _formCID);
    }
    
    function submitResponse(uint256 _formId, string memory _responseCID) public {
        require(forms[_formId].isActive, "Form is not active");
        
        formResponses[_formId].push(Response(
            msg.sender,
            _responseCID,
            block.timestamp
        ));
        
        emit ResponseSubmitted(_formId, msg.sender, _responseCID);
    }
    
    function getForm(uint256 _formId) public view returns (Form memory) {
        return forms[_formId];
    }
    
    function getFormResponses(uint256 _formId) public view returns (Response[] memory) {
        return formResponses[_formId];
    }

    function deactivateForm(uint _formId) public onlyAdmin{
        require(forms[_formId].isActive,"Form is not active");
        forms[_formId].isActive = false;
        emit FormDeactivated(_formId);
            }
}