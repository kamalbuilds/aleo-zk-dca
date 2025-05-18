import {
  Account,
  initThreadPool,
  PrivateKey,
  ProgramManager,
  AleoKeyProvider,
  AleoNetworkClient,
  NetworkRecordProvider,
  RecordCiphertext,
  RecordPlaintext
} from "@provablehq/sdk";

await initThreadPool();

// The name of our deployed DCA program
const DCA_PROGRAM_ID = "zk_dca_arcane_finance.aleo";

async function localProgramExecution(program: string, aleoFunction: string, inputs: string[]) {
  const programManager = new ProgramManager();

  // Create a temporary account for the execution of the program
  const account = new Account();
  programManager.setAccount(account);

  const executionResponse = await programManager.run(
      program,
      aleoFunction,
      inputs,
      false,
  );
  return executionResponse.getOutputs();
}

function getPrivateKey() {
  return new PrivateKey().to_string();
}

async function createAccount() {
  const account = new Account();
  return {
    privateKey: account.privateKey().to_string(),
    viewKey: account.viewKey().to_string(),
    address: account.address().to_string()
  };
}

async function createDCAPosition(
  privateKey: string, 
  inputTokenId: number,
  inputAmount: number,
  outputTokenId: number, 
  interval: number,
  executionsRemaining: number,
  minOutputAmount: number,
  blockHeight: number
) {
  try {
    // Setup network and account
    const account = new Account({privateKey});
    const networkClient = new AleoNetworkClient("https://api.explorer.provable.com/v1");
    const keyProvider = new AleoKeyProvider();
    keyProvider.useCache(true);
    const recordProvider = new NetworkRecordProvider(account, networkClient);
    
    const programManager = new ProgramManager("https://api.explorer.provable.com/v1", keyProvider, recordProvider);
    programManager.setAccount(account);
    
    // Format inputs for Leo program
    const inputs = [
      `${inputTokenId}u64`,
      `${inputAmount}u64`,
      `${outputTokenId}u64`,
      `${interval}u32`,
      `${executionsRemaining}u32`,
      `${minOutputAmount}u64`,
      `${blockHeight}u32`
    ];
    
    // Corrected execute method signature
    const fee = 0.2; // Fee in credits
    const txId = await programManager.run(
      DCA_PROGRAM_ID,
      "create_position",
      inputs,
      false // online = false
    );
    
    // Get transaction details (simplified for testing purposes)
    return {
      success: true,
      txId,
      result: txId.getOutputs()
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function executeDCA(
  privateKey: string,
  positionRecord: string,
  tokenRecord: string,
  blockHeight: number
) {
  try {
    // Setup network and account
    const account = new Account({privateKey});
    const networkClient = new AleoNetworkClient("https://api.explorer.provable.com/v1");
    const keyProvider = new AleoKeyProvider();
    keyProvider.useCache(true);
    const recordProvider = new NetworkRecordProvider(account, networkClient);
    
    const programManager = new ProgramManager("https://api.explorer.provable.com/v1", keyProvider, recordProvider);
    programManager.setAccount(account);
    
    // Format inputs for Leo program
    const inputs = [
      positionRecord,
      tokenRecord,
      `${blockHeight}u32`
    ];
    
    // Corrected execute method signature
    const fee = 0.2; // Fee in credits
    const txId = await programManager.run(
      DCA_PROGRAM_ID,
      "execute_dca",
      inputs,
      false // online = false
    );
    
    // Get transaction details (simplified for testing purposes)
    return {
      success: true,
      txId,
      result: txId.getOutputs()
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function cancelPosition(
  privateKey: string,
  positionRecord: string
) {
  try {
    // Setup network and account
    const account = new Account({privateKey});
    const networkClient = new AleoNetworkClient("https://api.explorer.provable.com/v1");
    const keyProvider = new AleoKeyProvider();
    keyProvider.useCache(true);
    const recordProvider = new NetworkRecordProvider(account, networkClient);
    
    const programManager = new ProgramManager("https://api.explorer.provable.com/v1", keyProvider, recordProvider);
    programManager.setAccount(account);
    
    // Format inputs for Leo program
    const inputs = [positionRecord];
    
    // Corrected execute method signature
    const fee = 0.2; // Fee in credits
    const txId = await programManager.run(
      DCA_PROGRAM_ID,
      "cancel_position",
      inputs,
      false // online = false
    );
    
    // Get transaction details (simplified for testing purposes)
    return {
      success: true,
      txId,
      result: txId.getOutputs()
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function getBlockHeight() {
  try {
    const networkClient = new AleoNetworkClient("https://api.explorer.provable.com/v1");
    const blockHeight = await networkClient.getLatestHeight();
    return { 
      success: true, 
      blockHeight 
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function getRecords(privateKey: string, viewKey: string) {
  try {
    const account = new Account({privateKey});
    const networkClient = new AleoNetworkClient("https://api.explorer.provable.com/v1");
    
    // Simplified version that doesn't use recordProvider.getRecords
    // In a real app, you'd need to implement record fetching via transactions
    return {
      success: true,
      records: []
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

onmessage = async function (e) {
  switch (e.data.type) {
    case "createAccount":
      const accountInfo = await createAccount();
      postMessage({type: "createAccount", result: accountInfo});
      break;
      
    case "createDCAPosition":
      const { privateKey, inputTokenId, inputAmount, outputTokenId, interval,
              executionsRemaining, minOutputAmount, blockHeight } = e.data.params;
      const positionResult = await createDCAPosition(
        privateKey, inputTokenId, inputAmount, outputTokenId, 
        interval, executionsRemaining, minOutputAmount, blockHeight
      );
      postMessage({type: "createDCAPosition", result: positionResult});
      break;
    
    case "executeDCA":
      const executeResult = await executeDCA(
        e.data.params.privateKey,
        e.data.params.positionRecord,
        e.data.params.tokenRecord,
        e.data.params.blockHeight
      );
      postMessage({type: "executeDCA", result: executeResult});
      break;
      
    case "cancelPosition":
      const cancelResult = await cancelPosition(
        e.data.params.privateKey,
        e.data.params.positionRecord
      );
      postMessage({type: "cancelPosition", result: cancelResult});
      break;
      
    case "getBlockHeight":
      const heightResult = await getBlockHeight();
      postMessage({type: "getBlockHeight", result: heightResult});
      break;
      
    case "getRecords":
      const recordsResult = await getRecords(
        e.data.params.privateKey,
        e.data.params.viewKey
      );
      postMessage({type: "getRecords", result: recordsResult});
      break;
  }
};
