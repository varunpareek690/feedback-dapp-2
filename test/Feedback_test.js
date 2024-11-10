// test/FeedbackSystem.js
const { expect } = require("chai");

describe("FeedbackSystem", function () {
  let feedbackSystem;
  let admin, user1, user2;

  beforeEach(async () => {
    [admin, user1, user2] = await ethers.getSigners();
    const FeedbackSystem = await ethers.getContractFactory("FeedbackSystem"); 
    feedbackSystem = await FeedbackSystem.deploy();  
  });

  it("should deploy the contract with the correct admin", async () => {
    const contractAdmin = await feedbackSystem.admins(admin.address);
    expect(contractAdmin).to.equal(true); 
  });

  it("should allow admin to create a form", async () => {
    const formCID = "QmSomeCID"; 
    await feedbackSystem.connect(admin).createForm(formCID); 
    
    const form = await feedbackSystem.getForm(1);  
    
    expect(form.formCID).to.equal(formCID);            
    expect(form.creator).to.equal(admin.address);  
    expect(form.isActive).to.equal(true);  
  });

  it("should not allow non-admin to create a form", async () => {
    const formCID = "QmSomeCID";  
    await expect(
      feedbackSystem.connect(user1).createForm(formCID)  // User1 tries to create a form
    ).to.be.revertedWith("Only admin can perform this action");  // It should fail with this revert message
  });

  it("should allow users to submit responses", async () => {
    const formCID = "QmSomeCID";
    await feedbackSystem.connect(admin).createForm(formCID);  // Admin creates a form
    const formId = 1;  // The form created will have ID 1
    
    const responseCID = "QmResponseCID";  // Sample response CID (IPFS)
    await feedbackSystem.connect(user1).submitResponse(formId, responseCID);  // User1 submits a response
    
    const responses = await feedbackSystem.getFormResponses(formId);  // Get all responses for form ID 1
    expect(responses.length).to.equal(1);  // There should be one response
    expect(responses[0].respondent).to.equal(user1.address);  // Check if the respondent is user1
    expect(responses[0].responseCID).to.equal(responseCID);  // Check if the response CID matches
  });

  it("should not allow submitting response to an inactive form", async () => {
    const formCID = "QmSomeCID";
    await feedbackSystem.connect(admin).createForm(formCID);  // Admin creates a form
    const formId = 1;
    
    // Deactivate the form manually (setting isActive to false)
    await feedbackSystem.connect(admin).createForm(formCID);  // Admin creates another form (formId 2)
    await feedbackSystem.connect(admin).createForm(formCID);  // Admin creates another form (formId 3)
    const form = await feedbackSystem.getForm(3);  // Check if form 3 is active
    feedbackSystem.deactivateForm(formId);

    // User tries to submit a response to an inactive form (formId 1)
    await expect(
      feedbackSystem.connect(user2).submitResponse(formId, "QmNewResponseCID")
    ).to.be.revertedWith("Form is not active");
  });

  it("should allow an admin to add a new admin", async () => {
    await feedbackSystem.connect(admin).addAdmin(user1.address);  // Admin adds user1 as an admin
    const isUser1Admin = await feedbackSystem.admins(user1.address);  // Check if user1 is now an admin
    expect(isUser1Admin).to.equal(true);  // user1 should be an admin
  });

  it("should not allow non-admin to add a new admin", async () => {
    await expect(
      feedbackSystem.connect(user1).addAdmin(user2.address)  // User1 tries to add user2 as an admin
    ).to.be.revertedWith("Only admin can perform this action");  // It should fail with this revert message
  });

  it("should emit events on form creation and response submission", async () => {
    const formCID = "QmSomeCID";
    await expect(feedbackSystem.connect(admin).createForm(formCID))
      .to.emit(feedbackSystem, "FormCreated")  // Expect "FormCreated" event to be emitted
      .withArgs(1, admin.address, formCID);  // Event args: formId, creator, formCID

    const responseCID = "QmResponseCID";
    await expect(feedbackSystem.connect(user1).submitResponse(1, responseCID))
      .to.emit(feedbackSystem, "ResponseSubmitted")  // Expect "ResponseSubmitted" event to be emitted
      .withArgs(1, user1.address, responseCID);  // Event args: formId, respondent, responseCID
  });

  it("should allow an admin to deactivate a form", async () => {
    const formCID = "QmSomeCID";
    await feedbackSystem.connect(admin).createForm(formCID);  // Admin creates a form
    
    await feedbackSystem.connect(admin).deactivateForm(1);  // Admin deactivates form ID 1
    
    const form = await feedbackSystem.getForm(1);  // Get the form by its ID
    expect(form.isActive).to.equal(false);  // The form should now be inactive
  });

  it("should not allow a non-admin to deactivate a form", async () => {
    const formCID = "QmSomeCID";
    await feedbackSystem.connect(admin).createForm(formCID);  // Admin creates a form
    
    await expect(
      feedbackSystem.connect(user1).deactivateForm(1)  // User1 tries to deactivate form ID 1
    ).to.be.revertedWith("Only admin can perform this action");  // It should fail with this revert message
  });
});

