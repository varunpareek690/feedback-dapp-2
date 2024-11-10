async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    const FeedbackSystem = await ethers.getContractFactory("FeedbackSystem");
    const feedbackSystemContract = await FeedbackSystem.deploy();
  
  console.log("Feedback System deployed to:", await feedbackSystemContract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
